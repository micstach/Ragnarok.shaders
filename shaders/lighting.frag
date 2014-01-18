struct spotlight {
 vec3 position;
 vec3 direction;
} ;

struct omnilight {
 float falloff ;
 vec3 position ;
 sampler2DShadow depthmapSampler[6] ;
 mat4 depthmapTransform[6] ;
} ;

uniform vec4 uni_Range ;
uniform int uni_MapsCount ;
uniform int uni_Quality ;
uniform spotlight uni_SpotLight ;
uniform omnilight uni_OmniLight ;
      
uniform sampler2D uni_Normal ;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_RndNormals ;

uniform vec4 uni_SunDir ;
uniform vec3 uni_Position ;
uniform vec2 uni_ScreenCoords ;
uniform vec2 uni_Size ;
uniform mat4 uni_ModelviewProjection ;
uniform vec3 uni_DepthDirection ;

varying vec3 var_eyeRay ;
varying vec2 var_TexCoords ;

uniform int uni_Mode ;

// random (sphere) samples
uniform vec3 uni_Samples8[8] ;
#define SAMPLES 8 

#define UNPACK_NORMAL

const float eps = 0.707 ;

float OmniShadow(omnilight light, vec4 point)
{
   vec3 p = point.xyz - light.position ;
   
   vec3 pointLightXY = normalize(vec3(p.x, p.y, 0.0)) ;
   vec3 pointLightXZ = normalize(vec3(p.x, 0.0, p.z)) ;
   vec3 pointLightYZ = normalize(vec3(0.0, p.y, p.z)) ;

   float shadow = 1.0 ;
   float bias = 0.499 ;
   
   if (pointLightXY.x > eps && pointLightXZ.x > eps)
   {   
      vec4 p = light.depthmapTransform[0] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[0], v).r ;
   }
   else if (-pointLightXY.x > eps && -pointLightXZ.x > eps)
   {
      vec4 p = light.depthmapTransform[1] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[1], v).r ;
   }   
   else if (pointLightXZ.z > eps && pointLightYZ.z > eps)
   {
      vec4 p = light.depthmapTransform[2] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[2], v).r ;
   }   
   else if (-pointLightXZ.z > eps && -pointLightYZ.z > eps)
   {
      vec4 p = light.depthmapTransform[3] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[3], v).r ;
   }   
   else if (pointLightXY.y > eps && pointLightYZ.y > eps)
   {
      vec4 p = light.depthmapTransform[4] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[4], v).r ;
   }   
   else if (-pointLightXY.y > eps && -pointLightYZ.y > eps)
   {
      vec4 p = light.depthmapTransform[5] * point ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
      shadow = shadow2DProj(light.depthmapSampler[5], v).r ;
   }  
   
   if (shadow > 0.001)
   { 
      float falloff = light.falloff ;
      float d = length(p) ;
      float att = max(1.0 - pow((d / falloff), 1.0), 0.0) ;   
      shadow *= att ;
   }
   return shadow ;
}

float SunShadow(float z, vec4 vertex, omnilight light)
{
   float bias = 0.4999 ;

   if (z < uni_Range.x) 
   {  
      // nearest shadow
      if (uni_Quality > 0)
      {
         float shadow = 0.0 ;
         vec2 ratio = vec2(1.0/uni_Size) / 64.0 ; // const
      
         // packed unit length vector
         vec3 nrm = texture2D(uni_RndNormals, var_TexCoords * ratio).rgb ;
         nrm = normalize(nrm * 2.0 - vec3(1.0)) ;
      
         for (int i=0; i<SAMPLES; i++)
         {
            vec4 v = vertex + vec4(0.5 * reflect(uni_Samples8[i], nrm), 0.0) ;
            vec4 p = light.depthmapTransform[0] * v ;
            float oow = 0.5 / p.w ;
            vec4 pv = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
            shadow += shadow2DProj(light.depthmapSampler[0], pv).r ;
         }
         return (shadow / float(SAMPLES)) ;
      }
      else
      {
         vec4 v = vertex ;
         vec4 p = light.depthmapTransform[0] * v ;
         float oow = 0.5 / p.w ;
         vec4 pv = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + bias, 1.0) ;
         return shadow2DProj(light.depthmapSampler[0], pv).r ;
      }      
      
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


void main()
{
   float z = texture2D(uni_Depth, var_TexCoords).r ;
   vec4 normal = texture2D(uni_Normal, var_TexCoords) ;


   //{  // transform depth onto linear depth   
   float n = 1.0 ;
   float f = 4000.0 ;
   z = (n*f) / (f - z * (f - n)) ;
   //}

   // multiply eyeRay by depth to get world space eyeRay
   // world space coordinates of screen point
   vec4 vertex = vec4(uni_Position + var_eyeRay * z, 1.0) ;

   float shadow = 1.0; 
   
   if (uni_Mode > 0)
   {
      vertex.y = -vertex.y ;
   }
   
      vertex += vec4(uni_DepthDirection, 0.0) ;
   
      if (normal.w < 1.0)
      {
         if (uni_MapsCount == 6)
         {
            shadow = OmniShadow(uni_OmniLight, vertex) ;
         }
         else if (uni_MapsCount == 3)
         {
            float depth = dot(vertex.xyz - uni_Position.xyz, -uni_DepthDirection) ;

            shadow = SunShadow(depth, vertex, uni_OmniLight) ;
            
            if (vertex.y < 0.0)
               shadow = min(shadow + (-vertex.y/25.0), 1.0)  ;
               
         }
      }
   
      
   gl_FragData[0] = vec4(shadow) ; 
   
   
}
