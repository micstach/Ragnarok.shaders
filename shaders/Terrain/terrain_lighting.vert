uniform vec4 uni_SunDir ;
uniform float uni_FlipY ;

varying float var_Color ;
varying vec3 var_Vertex ;

#define _VERTEX_SHADER
#define _CSM
#include <shadow.h>
   
void main()
{
   gl_Position = ftransform() ;

   var_Color = max(dot(gl_Normal, uni_SunDir.xyz), 0.0) ;

   //CSM_TexCoords(0, gl_Vertex) ;
   
   vec4 vertex = gl_Vertex ;
   
   vertex.y = uni_FlipY * vertex.y ;
   
   var_Vertex = vertex.xyz ;
   
   gl_ClipVertex = vertex ;
}
