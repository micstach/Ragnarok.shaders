uniform sampler2D uni_Frame ;
uniform sampler2D uni_BlurredFrame ;
uniform sampler2D uni_Luminance ;
uniform float uni_RefLuminance ;
uniform int uni_ShaderMode ;
uniform float uni_GlowPower ;
uniform float uni_Exposition ;
uniform float uni_GammaFilter ;

void main()
{
   if (uni_ShaderMode == 0) // hdr composition
   {
      vec4 color = texture2D(uni_Frame, gl_TexCoord[0].xy) ;
      vec4 L = texture2DLod(uni_Luminance, gl_TexCoord[0].xy, 8.0) ;
      float lum = L.r ;
      float exposure = L.g ; // previous exposition value
      
      float delta = (uni_RefLuminance - lum) ;
      
      exposure = exposure + (delta * 64.0 / 255.0) ;
      exposure = clamp(exposure, 0.0, 1.0) ;   
      vec4 blur = texture2D(uni_BlurredFrame, gl_TexCoord[0].xy) ;
      vec4 c = mix(color, blur, uni_GlowPower) ;
      c *= (exposure * uni_Exposition) ;

      // apply gamma filter
      float Y = dot(vec4(0.33, 0.58, 0.11, 0.0), c) ;
      Y = mix(Y, 1.0, 1.0 - uni_GammaFilter) ;
      gl_FragColor = c * Y ;
      gl_FragColor.a = exposure ;
   }
   else if (uni_ShaderMode == 1) // luminance 
   {
      vec4 color = texture2D(uni_Frame, gl_TexCoord[0].xy) ;
      gl_FragColor.r = pow((color.r + color.g + color.b) * 0.33, 2.0) * 0.6 ;
      gl_FragColor.g = color.a ; // previous exposition (for previuos luminance)
      gl_FragColor.b = 1.0 ;
      gl_FragColor.a = 1.0 ;
   }
   else if (uni_ShaderMode == 2) // downsample
   {
      gl_FragColor = texture2D(uni_Frame, gl_TexCoord[0].xy) ;
   }
}
