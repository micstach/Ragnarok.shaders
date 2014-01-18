uniform sampler2D uni_Diffuse ;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_Lookup ;

uniform vec4 uni_SunDir ;
uniform vec3 uni_Position ;
uniform vec2 uni_ScreenCoords ;
uniform vec2 uni_Size ;
uniform mat4 uni_ModelviewProjection ;
uniform vec3 uni_DepthDirection ;
uniform int uni_LightsCount ;

varying vec3 var_eyeRay ;
varying vec2 var_TexCoords ;

#define UNPACK_NORMAL

float d = 1.0 / 1024.0 ;

struct omnilight {
 float falloff ;
 vec3 position ;
 sampler2DShadow depthmapSampler[6] ;
 mat4 depthmapTransform[6] ;
} ;

uniform vec4 uni_Range ;
uniform int uni_MapsCount ;
uniform omnilight uni_OmniLight ;

float SunShadow(float z, vec4 vertex, omnilight light)
{
   float bias = 0.499 ;

   if (z < uni_Range.x) 
   {  
      vec4 v = vertex ;
      vec4 p = light.depthmapTransform[0] * v ;
      float oow = 0.5 / p.w ;
      vec4 pv = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      return shadow2DProj(light.depthmapSampler[0], pv).r ;
   }
   else if (z < uni_Range.y)
   {  // medium
      vec4 p = light.depthmapTransform[1] * vertex ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      return shadow2DProj(light.depthmapSampler[1], v).r ;
   }
   else if (z < uni_Range.y)
   {  // far
      vec4 p = light.depthmapTransform[2] * vertex ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      return shadow2DProj(light.depthmapSampler[2], v).r ;
   }
   
   return 1.0 ;
}

float testRay(vec3 a, vec3 b,  int steps)
{
   vec3 step = (b - a) / float(steps) ;
   float s = 0.0 ;

   for (int i=0; i<steps; i++)
   {
       s += SunShadow(length(b - a), vec4(a + step, 1.0), uni_OmniLight) ;
       
       a += step ;
   }
   return s/float(steps) ;
}

vec3 surfaceNormal(vec3 p)
{
   vec3 n = vec3(0,0,0) ;
   
   // neighbour heights
   float h0 = texture2D(uni_Lookup, var_TexCoords.xy/32.0).r - 0.5;
   float h1 = texture2D(uni_Lookup, var_TexCoords.xy/32.0 + vec2(d,0)).r - 0.5;
   float h2 = texture2D(uni_Lookup, var_TexCoords.xy/32.0 + vec2(0,d)).r - 0.5;
   float h3 = texture2D(uni_Lookup, var_TexCoords.xy/32.0 + vec2(-d,0)).r - 0.5;
   float h4 = texture2D(uni_Lookup, var_TexCoords.xy/32.0 + vec2(0,-d)).r - 0.5;
   
   float s = 1.0 ; // scale heightmap value
   float r = 1.0 ; // radius
      
   vec3 v0 = vec3(0.0, s * h0, 0.0) ;
   vec3 v1 = vec3(-r, s * h1, 0.0) ;
   vec3 v2 = vec3(0.0, s * h2, r) ;
   vec3 v3 = vec3(r, s * h3, 0.0) ;
   vec3 v4 = vec3(0.0, s * h4, -r) ;
      
   // normal composition
   n += cross(v1 - v0, v2 - v0) ;
   n += cross(v2 - v0, v3 - v0) ;
   n += cross(v3 - v0, v4 - v0) ;
   n += cross(v4 - v0, v1 - v0) ;
      
   return normalize(n) ;
}

vec3 getNormal(vec3 p, vec2 x)
{
   float t = -(p.y / uni_SunDir.y) ;
   vec3 s = uni_SunDir.xyz * t + p ;
   
   // find water surface normal for s.xz
   
   vec3 n = vec3(0,0,0) ;
   float c = 1000.0 ;
   
   // neighbour heights
   float h0 = texture2D(uni_Lookup, s.xz/c + x).r - 0.5;
   float h1 = texture2D(uni_Lookup, s.xz/c + x + vec2(d,0)).r - 0.5;
   float h2 = texture2D(uni_Lookup, s.xz/c + x + vec2(0,d)).r - 0.5;
   float h3 = texture2D(uni_Lookup, s.xz/c + x + vec2(-d,0)).r - 0.5;
   float h4 = texture2D(uni_Lookup, s.xz/c + x + vec2(0,-d)).r - 0.5;
   
   float r = 1.0 ; // radius
      
   vec3 v0 = vec3(0.0, h0, 0.0) ;
   vec3 v1 = vec3(-r, h1, 0.0) ;
   vec3 v2 = vec3(0.0, h2, r) ;
   vec3 v3 = vec3(r, h3, 0.0) ;
   vec3 v4 = vec3(0.0, h4, -r) ;
      
   // normal composition
   n += cross(v1 - v0, v2 - v0) ;
   n += cross(v2 - v0, v3 - v0) ;
   n += cross(v3 - v0, v4 - v0) ;
   n += cross(v4 - v0, v1 - v0) ;
      
   return normalize(n) ;
}   
   
float getCaustic(vec3 p)
{
   if (p.y >= -1.0) return 0.0 ;
   
   float c = 0.0 ;

   float t = -(p.y / uni_SunDir.y) ;
   vec3 sdp = uni_SunDir.xyz * t + p ;
   
   int rr = 10 ;
   for (int y=-rr; y<=rr; y++)
   for (int x=-rr; x<=rr; x++)
   {
      vec3 n = getNormal(p, vec2(float(x) * d/32.0, float(y) * d/32.0)) ;
      vec3 pp = sdp - n * t ;
      //vec3 d = max(dot(n, uni_SunDir.xyz), 0.0) ;     
      float s = 1024.0 ;      
      c += exp(-length(p - pp)/0.5) ;
   }
   
   return c / float((rr + 1)*(rr + 1)) ;
}

void main()
{
  // build surface normal
   vec3 n = vec3(0,0,0) ;
   {
      n = surfaceNormal(vec3(0,0,0)) ;
   }

   n.xz *= vec2(0.05, 0.05) ;
   float z = texture2D(uni_Depth, var_TexCoords + n.xz).r ;
   vec4 color = texture2D(uni_Diffuse, var_TexCoords + n.xz) ;
   
   color.rgb *= vec3(0.5, 0.5, 0.8) ;
   
   //{  //decode linear depth
   float np = 1.0 ;
   float fp = 4000.0 ;
   z = (np * fp) / (fp - z * (fp - np)) ;
   //}

   // multiply eyeRay by depth to get world space eyeRay
   // world space coordinates of screen point
   vec4 vertex = vec4(uni_Position + var_eyeRay * z, 1.0) ;
     
   vec3 pv = uni_Position + var_eyeRay * min(z, 200.0) ;  
   float p = testRay(uni_Position.xyz, pv, 100) ; 
      
   float _exp = exp(-z * 0.02) ;
   float k = 1.0 - _exp ;
   k = clamp(k, 0.0, 1.0) ;

   float k1 = 100.0 / (1.0 + abs(vertex.y)) ;
   k1 = clamp(k1, 0.0, 1.0) ;   
   
   //vec3 nn = getNormal(vertex.xyz) ;
   //float caustic = getCaustic(vertex.xyz) ;
   //color.rgb += vec3(caustic) * testRay(uni_Position.xyz, pv, 1)  ;
   // float spec = pow(max(dot(nn, uni_SunDir), 0.0), 64.0) ;
   //color.rgb += vec3(spec) * testRay(uni_Position.xyz, pv, 1) ;
   
   vec3 output_ = color.rgb * k1 * _exp  + pow(p, 1.0) * vec3(0.1 ,0.12, 0.1) * (1.0 - _exp) * 1.0 ;
   
   
   
   gl_FragData[0] = vec4(output_, 1.0) ;
    
   //gl_FragData[0] = vec4(vec3(caustic), 0) ;     
   
   //gl_FragData[0] = vec4(p, p, p, 1.0) ;
}
