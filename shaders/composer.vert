uniform mat4 uni_WaterReflectionTransform ;
uniform int uni_Final ;

void main()
{
   //vec4 color = gl_Color ;
   if (uni_Final == 10) // water
   {
      vec4 p = gl_Vertex ;
      p.w = 1.0 ;
      p = uni_WaterReflectionTransform * p ;

      gl_TexCoord[0] = gl_MultiTexCoord0 ;//vec4((p.x/p.z) * 0.5 + 0.5, 
                            //(p.y/p.z) * 0.5 + 0.5, 
                            //(p.z/p.w) * 0.5 + 0.5, 
                            //1.0) ;
                            
      vec4 p1 = gl_Vertex ;
      gl_Position = gl_ModelViewProjectionMatrix * p1 ;
      gl_ClipVertex = p1 ;                      
   }
   else 
   {
      gl_TexCoord[0] = gl_MultiTexCoord0 ;
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex ;
   }

   //gl_TexCoord[1] = gl_MultiTexCoord1 ;
   //gl_TexCoord[2] = gl_MultiTexCoord2 ;
   //gl_TexCoord[3] = gl_MultiTexCoord3 ;
   
}
