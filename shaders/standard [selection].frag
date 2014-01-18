uniform vec4 uni_Color;
uniform float uni_Transparency ;

void main()
{
   gl_FragData[0] = vec4(uni_Color.rgb, uni_Transparency) ;
   gl_FragData[1] = vec4(0.0) ;
   gl_FragData[2] = vec4(0.0) ;
}
