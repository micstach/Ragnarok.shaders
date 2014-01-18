uniform sampler2D 	uni_CloudsMap ;
uniform sampler2D 	uni_LightMap ;
uniform float            uni_Sharpness ;
uniform vec3           uni_ObsPos ;
varying vec3 	PixelPos ;

void main()
{
   float c = texture2D(uni_CloudsMap, gl_TexCoord[0].xy).r ;

   c = (255.0 - 255.0 * pow(uni_Sharpness, c * 255.0)) / 255.0 ;

   vec4 LightMap = texture2D(uni_LightMap, gl_TexCoord[0].xy) ;
   float shadow = LightMap.r ;
   float backlight = LightMap.g ;
   vec3 color = vec3(1, 1, 1)  * shadow + backlight ;
   vec3 cld_pos = vec3(PixelPos) ;
   float alpha = c - pow(length(cld_pos)/4000.0,2.0) ;
   
   gl_FragData[0] = vec4(color, alpha) ;	

   // (!) value 1.0 in fourth component disable lighting calculations
   //     shadows/ssao etc check for condition(normal.w < 1.0)
   gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0) ;
   gl_FragData[2] = vec4(0.0, 0.0, 0.0, 0.0) ;
}
