//
uniform mat4 uni_Transformation ; 
uniform vec4 uni_SunDir ;
uniform float uni_Flipped ;

// varyings
varying vec3 var_Color ;
varying vec3 var_Vertex ;
varying vec3 var_Normal ;
varying float var_z ;

void main() 
{ 
   gl_TexCoord[0] = gl_MultiTexCoord0 ; 
   
   vec4 vertex = uni_Transformation * gl_Vertex ; 
  
   var_z = -(gl_ModelViewMatrix * vertex).z ;
  
   //var_Color = gl_Color.rgb ;
   var_Vertex = vertex.xyz ;
   //var_Normal = vec3(uni_Transformation * vec4(gl_Normal, 0.0)) ;
   
   vertex.y = uni_Flipped * vertex.y ;  
   gl_ClipVertex = vertex ; 
   gl_Position = gl_ModelViewProjectionMatrix * vertex ; 
}
