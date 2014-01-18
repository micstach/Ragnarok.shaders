#version 120

uniform sampler2D uni_Depth ;

void main()
{
   float z = texture2D(uni_Depth, gl_TexCoord[0].xy).r ;
   
   float n = 1.0 ;
   float f = 4000.0 ;
   z = (n * f) / (f - z * (f - n)) ;
      
   
   gl_FragColor.rgb = vec3(0.0) ;
   gl_FragColor.a = z/4000.0 ; 
   
   
}
