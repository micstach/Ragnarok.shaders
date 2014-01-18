uniform sampler2D uni_SkyColorTxt ;
uniform vec3 uni_Center;
uniform vec3 uni_SunDir ;
uniform float uni_Flipped ;
varying vec3 PixelPos ;


void main()
{
   vec4 color = texture2D(uni_SkyColorTxt, gl_TexCoord[0].xy) ;
   // sun
   vec3 sphere = normalize(PixelPos - uni_Center) ;
   vec3 sundir = uni_SunDir ;
   sundir.y = uni_Flipped * sundir.y ;
   
   float s = pow(max(dot(sundir, sphere), 0.0), 4096.0) ;
   vec3 c = color.rgb + max(uni_Flipped, 0.0) * s ;             
   
   gl_FragData[0] = vec4(c, 1.0) ;
   gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0) ;
   gl_FragData[2] = vec4(0.0, 0.0, 0.0, 1.0) ;
}
	







