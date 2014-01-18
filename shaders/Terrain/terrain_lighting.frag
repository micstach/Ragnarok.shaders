uniform vec4 uni_ObsPos ;
uniform vec4 uni_SunDir ;
uniform float uni_FlipY ;

varying vec3 var_Vertex ;
varying float var_Color ;

#define _FRAGMENT_SHADER
#include <shadow.h>

float depth(vec3 p0, vec3 p1)
{
   if (uni_FlipY > 0.0)
   {
      if (p0.y < 0.0)
      {
         float t = -(p0.y / (p1.y - p0.y)) ;
         float l = length(t * (p1 - p0)) ;
         return pow(95.0/100.0, l) ;
      }
   }
   return 1.0 ;
} 

vec4 water(vec4 color)
{
   float d = depth(var_Vertex, uni_ObsPos.xyz) ;
   vec4 c = vec4(0,0.2,0.75, color.a) ;
   return mix(c, color, d) ;
}

void main()
{
   float intensity = var_Color ; 
 
   // multiply intensity by shadow factor   
   if (uni_DepthmapEnabled > 0)
   {
      intensity *= 1.0 ;//CSM_Shadow(0) ;
   }
   
   // apply ambient intensity
   intensity += uni_SunDir.w ;
   intensity = clamp(intensity, 0.0, 1.0) ;
   
   
   vec4 color = vec4(intensity, intensity, intensity, 1.0) ;
   gl_FragData[0] = color ;
   gl_FragData[1] = vec4(1.0, 1.0, 1.0, 0.0) ; 
   gl_FragData[2] = vec4(0.0, 0.0, 0.0, 0.0) ; 
}
