//
//
uniform mat4 uni_DepthmapTransform ;

//
// varyings
varying vec3 var_Vertex ;

void main() 
{ 
   vec4 vertex = gl_Vertex ; 
   gl_Position = ftransform() ;//gl_ModelViewProjectionMatrix * vertex ; 

   vec4 p = uni_DepthmapTransform * vertex;
   gl_TexCoord[0] = vec4(p.x * 0.5 + 0.5, p.y* 0.5 + 0.5, p.z * 0.5 + 0.5 - 0.005, 1.0) ;
   
   var_Vertex = vertex.xyz ;
}
