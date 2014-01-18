struct spotlight {
 vec3 position;
 vec3 direction;
} ;

struct omnilight {
 vec3 position;
 float falloff ;
} ;


uniform omnilight uni_OmniLight[4] ;
      
uniform sampler2D uni_NormalDepth ;
uniform sampler2D uni_Diffuse ;
uniform sampler2D uni_Material ;
uniform sampler2D uni_Ambient ;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_Lighting ;
uniform sampler2D uni_LightShaft ;

uniform vec4 uni_SunDir ;
uniform vec3 uni_Position ;
uniform vec2 uni_ScreenCoords ;
uniform vec2 uni_Size ;
uniform mat4 uni_ModelviewProjection ;
uniform vec3 uni_DepthDirection ;
uniform int uni_LightsCount ;

varying vec3 var_eyeRay ;
varying vec2 var_TexCoords ;

uniform int uni_Mode ;
uniform int uni_OutputMode ;
uniform float uni_AmbientFactor ;

const vec3 fogColor = vec3(152.0, 154.0, 182.0) * 0.00392 ;
float z = 0.0 ;

#define UNPACK_NORMAL

vec3 DiffLenAtt(float _att, vec3 lightVect, vec3 normal)
{
   float len = length(lightVect) ;
   
   _att = max(1.0 - (len / _att), 0.0) ;
   
   float diffuse = _att * max(dot(lightVect / len, normal.xyz), 0.0) ;
   
   return vec3(diffuse, len, _att) ;
}

vec2 DiffSpec(float _att, vec3 lightVect, vec4 point, vec4 normal, vec4 material) 
{
   // diffuse
   vec3 base = DiffLenAtt(_att, lightVect, normal.xyz) ;

   // specular - multiply by attenuation
   float level = material.y * base.z;
   if (level > 0.0)
   {
      // power factor is encoded
      float glossiness = material.x * 100.0 ;
      vec3 V = normalize(uni_Position.xyz - point.xyz) ; // viewer
      vec3 R = reflect(lightVect/base.y, normal.xyz) ;
      level *= pow(max(dot(-R, V), 0.0), glossiness) ;
   }
   
   return vec2(base.x, level) ;
}

vec2 SunLight(omnilight light, vec4 point, vec4 normal, vec4 material)
{
   vec2 diffspec = vec2(1.0, 0.0) * normal.w + (1.0 - normal.w) * DiffSpec(light.falloff, uni_SunDir.xyz, point, normal, material) ;   
   return diffspec ;
}

vec2 OmniLight(omnilight light, vec4 point, vec4 normal, vec4 material)
{
   vec2 diffspec = vec2(1.0, 0.0) * normal.w + (1.0 - normal.w) * DiffSpec(light.falloff, light.position - point.xyz, point, normal, material) ;   
   return diffspec ;
}

vec2 SpotLight(spotlight light, vec4 point, vec4 normal, vec4 material)
{
   if (normal.w > 0.0) return vec2(1.0, 0.0) ;
   
   vec3 lightVect = light.position - point.xyz ;
   
   vec2 diffspec = DiffSpec(10.0, lightVect, point, normal, material) ;   
     
   // spot light part
   float spot = max(dot(normalize(lightVect), light.direction), 0.0) ;
   float falloff = 0.7 ;
   float fallin = 0.9 ;
   if (spot < falloff) spot = 0.0 ;
   else if (spot <= fallin) spot = (spot - falloff) / (fallin - falloff) ;
   else spot = 1.0 ;
   diffspec *= spot ;
   
   return diffspec ;
}


const float Br = 0.0000050 ; // Rayleigh
const float Bm = 0.0000050 ; // Mie
const float g = 0.01 ; // Henyey/Greenstein phase
const float Esun =  50.0 ;
const float pi = 3.1415 ;

float BrT(float cosT)
{
   return (3.0 / (16.0 * pi)) * Br * (1.0 + cosT * cosT) ;
}

float BmT(float cosT)
{
   return (1.0 / (4.0 * pi)) * Bm * ((1.0 - g) * (1.0 - g)) / pow(1.0 + g*g - 2.0*g*cosT, 3.0/2.0) ;
}

float Fex(float d)
{
   return exp(-(Br + Bm) * d) ;
}

float Lin(float d, float cosT)
{
   return Esun * (1.0 - Fex(d)) * (BrT(cosT) + BmT(cosT)) / (Br + Bm)  ;
}  

vec3 Scattering(vec3 color, float d, float cosT)
{
   return color ;
/*
   if (uni_Mode < 1)
   {
      vec4 shaft = texture2D(uni_LightShaft, var_TexCoords) ;
      return color * Fex(d) + Lin(d, cosT) * shaft.a + shaft.r ; 
   }
   else
   {
      return color ;
   }
*/
}

vec3 depth(vec3 p, vec3 d)
{
   float k = 0.0 ;
   if (d.y != 0.0)
      k = -(p.y/d.y) ;
      
   return (p + k * d) ;
}

void main()
{
   z = texture2D(uni_Depth, var_TexCoords).r ;
   vec4 nd = texture2D(uni_NormalDepth, var_TexCoords) ;
   vec4 color = texture2D(uni_Diffuse, var_TexCoords) ;
   vec4 ambient = texture2D(uni_Ambient, var_TexCoords) ;
   vec4 material = texture2D(uni_Material, var_TexCoords) ;
   vec4 lighting = texture2D(uni_Lighting, var_TexCoords) ;
   
   //{  //decode linear depth
   float n = 1.0 ;
   float f = 4000.0 ;
   z = (n * f) / (f - z * (f - n)) ;
   //}

   // multiply eyeRay by depth to get world space eyeRay
   // world space coordinates of screen point
   vec4 vertex = vec4(uni_Position + var_eyeRay * z, 1.0) ;
   
   #ifdef UNPACK_NORMAL
   {
      nd.xyz = (nd.xyz * 2.0) - vec3(1.0) ;
      nd.xyz = normalize(nd.xyz) ;//vec3(0,1,0);
   }
   #endif
   
   //vertex.xyz += uni_DepthDirection ;

   if (uni_Mode == 1)
   {
      vertex.y = -vertex.y ;
   }
         
   vec3 view = (uni_Position.xyz - vertex.xyz) ;
      
   vec2 light = vec2(0.0, 0.0) ;
   if (uni_LightsCount > 0)
   {
      vec2 i = SunLight(uni_OmniLight[0], vertex, nd, material) ;
      
      
      if (vertex.y <= 0.0 && uni_Mode == 0)
      {
         
         float d = length(depth(vertex.xyz, uni_SunDir.xyz)) ;
         float d1 = length(depth(vertex.xyz, view.xyz)) ;
         //i *= exp(-(d + d1) * 0.0002) ;
      }
      
      light += 1.0 * i * lighting.r ;
      
   }
   
   if (uni_LightsCount > 1)
      light += 0.3 * OmniLight(uni_OmniLight[1], vertex, nd, material) * lighting.g ;
   
   if (uni_LightsCount > 2)
      light += 0.3 * OmniLight(uni_OmniLight[2], vertex, nd, material) * lighting.b ;
   
   if (uni_LightsCount > 3)
      light += 0.3 * OmniLight(uni_OmniLight[3], vertex, nd, material) * lighting.a ;

   // add some ambient
   if (uni_Mode < 1.0)
   {
      light.x = mix(light.x, ambient.r, uni_AmbientFactor) ; 
   }
   else
   {
      light.x = mix(light.x, 1.0, uni_AmbientFactor) ; 
   }
   
   // no specular component in case of reflection
   gl_FragData[0].rgb = color.rgb * light.x + (1.0 - float(uni_Mode)) * vec3(light.y) ;
   
   float cosT = dot(normalize(view), -uni_SunDir.xyz) ;   

   if (uni_OutputMode < 1)
   {
      gl_FragData[0].rgb = Scattering(gl_FragData[0].rgb, z, cosT) ;
   }
   else if (uni_OutputMode < 2)
   {
      gl_FragData[0].rgb = light.x + vec3(light.y) ;
   }
   else if (uni_OutputMode < 3)
   {
      gl_FragData[0].rgb = ambient.rgb ;
   }  
   else if (uni_OutputMode < 4) // depth
   {
      gl_FragData[0].rgb = vec3(z) / 4000.0 ;
   }
   else if (uni_OutputMode < 5) // normals
   {
      gl_FragData[0].rgb = nd.xyz ;
   }
   else if (uni_OutputMode < 6) // diffuse
   {
      gl_FragData[0].rgb = color.rgb ;
   }
      
   // encode y position of pixel on the screen
   // (!) watch out for blending 
   if (vertex.y > 0.0)
      gl_FragData[0].a = 1.0 ;
   else 
      gl_FragData[0].a = 0.0 ;
    
}
