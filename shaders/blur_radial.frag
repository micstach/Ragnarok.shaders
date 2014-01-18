#version 120

uniform sampler2D uni_Source ;
uniform vec2 uni_Center ;
uniform vec2 uni_InvTexSize ;

void main()
{
   // radial direction
   float w = 1.0 / uni_InvTexSize.x ;
   float h = 1.0 / uni_InvTexSize.y ;
   
   float a = h/w ;
   float r = 1.0;    
   vec2 t = gl_TexCoord[0].xy ;
   vec2 c = uni_Center ;
   
   // modify by screen width aspect
   c.x = (c.x - 0.5) * a + 0.5;
   
   vec2 d = (c - t) * r  ;
   
   //d.x *= 1.0 / a ;
   d *= 0.05 ;
   vec4 color = vec4(0.0) ;

   color += texture2D(uni_Source, t + d * 0.0) ;
   color += texture2D(uni_Source, t + d * 1.0) ;
   color += texture2D(uni_Source, t + d * 2.0) ;
   color += texture2D(uni_Source, t + d * 3.0) ;
   color += texture2D(uni_Source, t + d * 4.0) ;
   color += texture2D(uni_Source, t + d * 5.0) ;
   color += texture2D(uni_Source, t + d * 6.0) ;
   color += texture2D(uni_Source, t + d * 7.0) ;
      
   gl_FragColor.a = color.a / 16.0 ; 
   gl_FragColor.r = (color.a / 4.0) / (1.0 + length(d) * 250.0) ;
}
