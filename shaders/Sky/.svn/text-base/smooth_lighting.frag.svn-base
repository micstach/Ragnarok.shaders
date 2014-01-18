uniform sampler2D 	uni_Lightmap ;             // cloud map
float           var_PixelSize = 0.0078125 ;
void main()
{
      float x = gl_TexCoord[0].x ;
      float y = gl_TexCoord[0].y ;

      float c_sides = texture2D(uni_Lightmap, vec2(x - var_PixelSize, y)).r +
                               texture2D(uni_Lightmap, vec2(x + var_PixelSize, y)).r +
                               texture2D(uni_Lightmap, vec2(x, y - var_PixelSize)).r +
                               texture2D(uni_Lightmap, vec2(x, y + var_PixelSize)).r ;

      float c_corners  = texture2D(uni_Lightmap, vec2(x - var_PixelSize, y - var_PixelSize)).r +
                                    texture2D(uni_Lightmap, vec2(x - var_PixelSize, y + var_PixelSize)).r +
                                    texture2D(uni_Lightmap, vec2(x + var_PixelSize, y - var_PixelSize)).r +
                                    texture2D(uni_Lightmap, vec2(x + var_PixelSize, y + var_PixelSize)).r ;

       float c_center = texture2D(uni_Lightmap, vec2(x, y)).r ;
       gl_FragColor = texture2D(uni_Lightmap, vec2(x, y)) ;
       gl_FragColor.r = (c_center * 0.25) + (c_sides * 0.125)  + (c_corners * 0.0625);
}
