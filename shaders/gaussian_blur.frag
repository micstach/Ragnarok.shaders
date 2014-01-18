#version 120

uniform sampler2D uni_Source ;
uniform vec2 uni_blurDirection ;

float Gauss[9] = float[9](0.93, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1) ;
#define NORMALIZE (1.0/(0.93 + 2.0 * (0.8 + 0.7 + 0.6 + 0.5 + 0.4 + 0.3 + 0.2 + 0.1)))

void main()
{
   vec2 delta = vec2(0.0, 0.0) ;
   vec4 color = vec4(0.0, 0.0, 0.0, 0.0) ;

   color = Gauss[0] * texture2D(uni_Source, gl_TexCoord[0].xy) ;
   delta += uni_blurDirection ;

   { // 8 more samples
      color += Gauss[1] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[1] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;

      delta += uni_blurDirection ;
      color += Gauss[2] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[2] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;

      delta += uni_blurDirection ;
      color += Gauss[3] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[3] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;

      delta += uni_blurDirection ;
      color += Gauss[4] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[4] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;

      delta += uni_blurDirection ;
      color += Gauss[5] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[5] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;
      
      delta += uni_blurDirection ;
      color += Gauss[6] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[6] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;

      delta += uni_blurDirection ;
      color += Gauss[7] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[7] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;
      
      delta += uni_blurDirection ;
      color += Gauss[8] * texture2D(uni_Source, gl_TexCoord[0].xy + delta) ;
      color += Gauss[8] * texture2D(uni_Source, gl_TexCoord[0].xy - delta) ;
   }

   gl_FragColor = color * NORMALIZE;
}
