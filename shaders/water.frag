
uniform vec4 uni_Observer ;
uniform vec4 uni_SunDir ;
uniform sampler2D uni_Reflection ;
uniform sampler2D uni_Refraction ;
uniform sampler2D uni_Surface ; 
uniform sampler2D uni_Depth ;
uniform sampler2D uni_Heighfield ;
uniform sampler2D uni_Noise ;
uniform vec2 uni_heightRange ;
uniform mat4 uni_Modelview ;
uniform mat4 uni_ModelviewProjection ;
uniform float uni_AspectRatio ; // screen_height / screen_width
uniform float uni_Time ;
// water surface texture size
float d = 1.0 / 1024.0 ;

varying vec3 var_Vertex ;
varying float var_z ;

struct omnilight {
 float falloff ;
 vec3 position ;
 sampler2DShadow depthmapSampler[6] ;
 mat4 depthmapTransform[6] ;
} ;

uniform vec4 uni_Range ;
uniform int uni_MapsCount ;
uniform omnilight uni_OmniLight ;
varying float var_H ;

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
   float tw = 0.0 ; // total weight 
   
   for (int i=0; i<steps; i++)
   {
      float w = pow(1.0 - (float(i) / float(steps)), 8.0) ;
      s += w * SunShadow(length(b - a), vec4(a + step, 1.0), uni_OmniLight) ;
      tw += w ; 
      a += step ;
   }
   return s/tw ;
}

float _depth(float z)
{
   const float n = 1.0 ;
   const float f = 4000.0 ;
   
   return ((n * f) / (f - z * (f - n))) ;
}


float heightR(vec2 st)
{
   vec4 x = texture2D(uni_Surface, st) ;
   return (x.r) ;
}
float heightG(vec2 st)
{
   vec4 x = texture2D(uni_Surface, st) ;
   return (x.g) ;
}

float heightB(vec2 st)
{
   vec4 x = texture2D(uni_Surface, st) ;
   return (x.b) ;
}

float heightA(vec2 st)
{
   vec4 x = texture2D(uni_Surface, st) ;
   return (x.a) ;
}

varying vec3 var_N ;

vec4 texture2DBilinear(vec2 xy)
{
   const float textureSize = 1024.0 ;
   const float texelSize = 1.0/textureSize ;
   
   vec2 I = fract(xy * textureSize) ;

   // xy = floor(xy * textureSize) / textureSize ;

   vec4 t00 = texture2D(uni_Surface, xy) ;
   vec4 t10 = texture2D(uni_Surface, xy + vec2(texelSize, 0.0)) ;
   vec4 t01 = texture2D(uni_Surface, xy + vec2(0.0, texelSize)) ;
   vec4 t11 = texture2D(uni_Surface, xy + vec2(texelSize, texelSize)) ;
   
   // lerp
   vec4 _t0 = mix(t00, t10, I.x) ;
   vec4 _t1 = mix(t01, t11, I.x) ;
   
   return mix(_t0, _t1, I.y);
}

void main()
{
   // terrain heighfield
   float th = texture2D(uni_Heighfield, gl_TexCoord[1].xy).a ;
   th = uni_heightRange.x + th * (uni_heightRange.y - uni_heightRange.x) ;
   
   float scale = 1.0 ;
   // lookup water (base) height value
   float h0 = var_Vertex.y ; 
   
   // build surface normal
   vec3 n = normalize(var_N) ;
   {
      // neighbour heights
      vec2 t = gl_TexCoord[0].xy * 5.0 ;
      d /= 1.0 ;
      float h1 = texture2DBilinear(t + vec2(d, d)).r ;
      float h2 = texture2DBilinear(t + vec2(-d, d)).r ;
      float h3 = texture2DBilinear(t + vec2(-d, -d)).r ;
      float h4 = texture2DBilinear(t + vec2(d, -d)).r ;
      
      // cross neighbour
      float r = 1.0 ; 
      // detail normal
      vec3 dn = -2.0 * r * vec3(h1 - h3, -(r + r), h2 - h4) ;
      n += dn * 0.15 ; // scale normal - overall contribution factor
      n = normalize(n)  ;
   }
   
   // regular texture (projected) lookup coords
   vec2 regCoords = vec2(0,0) ;
   {   
      vec4 coords = vec4(var_Vertex, 1.0) ;
      vec4 projcoords = (uni_ModelviewProjection * coords) ;
      float oow = 0.5 / projcoords.w ;
      projcoords.x *= uni_AspectRatio ;
      regCoords = (projcoords * oow).xy + vec2(0.5, 0.5) ;
   }
   
   float z = _depth(texture2D(uni_Depth, regCoords).r) ;
   float z_diff = (z - var_z) ;
   float z_k = 1.0 - clamp(z_diff / 2.0, 0.0, 1.0) ;

   // disturbed texture (projected) lookup coords   
   // for reflection
   vec2 reflCoords = vec2(0,0) ;
   {
      vec4 coords = vec4(var_Vertex, 1.0) ;
      coords.xyz += vec3(n.x, h0/15.0, n.z) * 50.0 ; 
      
      vec4 projcoords = (uni_ModelviewProjection * coords) ;
      float oow = 0.5 / projcoords.w ;
      projcoords.x *= uni_AspectRatio ;
      reflCoords = (projcoords * oow).xy + vec2(0.50, 0.5) ;
      
      reflCoords = clamp(reflCoords, 0.0015, 0.9985) ;
   }
   
   // disturbed texture (projected) lookup coords   
   // for refraction
   vec2 refrCoords = vec2(0,0) ;
   {
      vec4 coords = vec4(var_Vertex, 1.0) ;
      coords.xyz -= vec3(n.x, h0/15.0, n.z) * 10.0 ;
      vec4 projcoords = (uni_ModelviewProjection * coords) ;
      float oow = 0.5 / projcoords.w ;
      projcoords.x *= uni_AspectRatio ;
      refrCoords = (projcoords * oow).xy + vec2(0.5, 0.5) ;
      
      refrCoords = clamp(refrCoords, 0.0015, 0.9985) ;
   }
  
   // view vector - pointing from observer to water surface
   // modified by water surface base heighfield value
   // finally normalized
   vec3 view = vec3(0,0,0) ;
   {
      view = normalize(uni_Observer.xyz - var_Vertex) ;
   }
  
   if (uni_Observer.y > 0.0)
   {
      float refz = _depth(texture2D(uni_Depth, refrCoords).r) ;
      float z_refr_diff = (refz - var_z) ;
      float z_refr_k = 1.0 - clamp(z_refr_diff / 15.0, 0.0, 1.0) ;

      vec4 refr = texture2D(uni_Refraction, refrCoords) ;//mix(refrCoords, regCoords, max(z_refr_k, z_k))) ;

      vec3 refl = texture2D(uni_Reflection, mix(reflCoords, regCoords, refr.a)).rgb ;
      
      if (refr.a > 0.0)
      {
         refr = texture2D(uni_Refraction, regCoords) ;
         refz = _depth(texture2D(uni_Depth, regCoords).r) ;
         z_refr_diff = (refz - var_z) ;
         z_refr_k = 1.0 - clamp(z_refr_diff / 15.0, 0.0, 1.0) ;
      }
   

      //vec3 pv = var_Vertex - vec3(n.x, h0, n.z) * scale * (1.0 - z_k) ;
      //vec3 vw = normalize(pv - uni_Observer.xyz) ;
      //float psh = testRay(pv, pv + vw * z_diff, 50) ; 
      
      // apply scattering - define final values
      // for refracted light and reflected
      float maxz = z_refr_diff ;//max(z_refr_diff, z_diff) ;
      float e = exp(-maxz/100.0) ;
      float s = max(uni_SunDir.y, 0.0) ;
      vec3 _refract = refr.rgb * e + s * 0.1 * vec3(0.01, 0.14, 0.16) * (1.0 - e)  ;
      vec3 _reflect = refl.rgb ;
  
      // refraction to reflection transition coefficient
      float p = 0.0 ;
      {
         float cosAlpha = dot(n, view) ;
         p = max(cosAlpha, 0.0) * 0.5 + 0.5 ;
      }
      
      // final water color
      //_reflect = vec3(1,1,1) ;
      //_refract = vec3(1,1,1) ;
      gl_FragData[0].rgb = mix(_reflect, _refract, p) ;
      //gl_FragData[0].rgb *= max(dot(uni_SunDir.xyz, n.xyz), 0.5) ;
      
      // add sun reflection
      float specular = 0.0 ;
      // vec3 H = normalize(uni_SunDir.xyz + view) ;
      // specular += pow(max(dot(H, n.xyz), 0.0), 128.0) ;
      vec3 R = reflect(view.xyz, n.xyz) ;
      specular += pow(max(dot(uni_SunDir.xyz, -R.xyz), 0.0), 128.0) ;

      // remap wave height into [-1, 1] 
      
      // build perlin foam
      float foamScale = 10.0 ;
      vec4 sf = vec4(128.0, 64.0, 32.0, 16.0) * foamScale ;

      //  procedural foam
      float foam_dir = clamp((var_Vertex.y/15.0), -1.0, 1.0) ;
      vec2 mod = 0.0001 * foam_dir * vec2(uni_Time, 0.0) ;
      mod += n.xz / 200.0 ;
      float f0 = texture2D(uni_Noise, mod + var_Vertex.xz / sf.x).a ;
      float f1 = texture2D(uni_Noise, mod + var_Vertex.xz / sf.y).a * 0.5 ;
      float f2 = texture2D(uni_Noise, mod + var_Vertex.xz / sf.z).a * 0.25 ;
      float f3 = texture2D(uni_Noise, mod + var_Vertex.xz / sf.w).a * 0.125 ;
      float f = (f0 + f1 + f2 + f3) / (1.0 + 0.5 + 0.25 + 0.125) ; 
      
      vec3 regular = texture2D(uni_Refraction, regCoords).rgb ;
      vec3 water = gl_FragData[0].rgb + specular ;
      
      float vh = 1.0 ;//abs(var_Vertex.y / 8.0) ;
      
      // foam distribution
      float fd = vh * (1.0 - clamp(z_diff/150.0, 0.0, 1.0)) ;
      
      float foam_size = 0.6 - 0.6 * max(var_Vertex.y / 15.0, 0.0) ;
      
      float fltr = 0.9 - foam_size * pow(fd, 2.0) ;
      f = max(f - fltr, 0.0)  ;
      f = pow(f, 0.75) ;
      vec3 foam = vec3(f) ;
      
      water = water + foam * pow(fd, 2.0) ;
      
      // gl_FragData[0].rgb = distToGround ;
      
      // gl_FragData[0].rgb = mix(mix(water, foam, z_k), regular, z_k) ;
      gl_FragData[0].rgb = mix(water, regular, z_k) ;

      gl_FragData[0].rgb = max(dot(uni_SunDir.xyz, n.xyz), 0.0) + specular ;
      //gl_FragData[0].rgb = n.xyz * 0.5 + vec3(0.5) ;
     
   }
   else 
   {
      vec3 refr = texture2D(uni_Refraction, refrCoords).rgb ; 
      vec3 refl = vec3(0.0) ;
      
      // camera under water  
      gl_FragData[0].rgb = refr ;
      gl_FragData[0].a = 1.0 ;
   }
}
