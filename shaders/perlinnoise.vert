varying vec3 var_Position ;

void main()
{
   gl_TexCoord[0] = gl_MultiTexCoord0 ;
   var_Position = gl_Vertex.xyz ;
   gl_Position = ftransform() ;
}
