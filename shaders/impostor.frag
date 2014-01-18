//
uniform mat4 uni_Transformation ; 
uniform sampler2D uni_Diffuse ;
uniform sampler2D uni_NormalDepth ;
uniform int uni_Mode ;
uniform float uni_MatOpacity ;

uniform float uni_SpecularPower ;
uniform float uni_SpecularFactor ;
uniform float uni_SelfIllumination ;

//
varying vec3 var_Color ;
varying vec3 var_Vertex ;
varying vec3 var_Normal ;

void mainRegular()
{
   vec2 texcoords = gl_TexCoord[0].xy ;
  
   vec4 diffuse = texture2D(uni_Diffuse, texcoords) ;   

   // (!) discard fragment (alpha test)
   if (diffuse.a <= uni_MatOpacity) discard ;

   vec4 normal = texture2D(uni_NormalDepth, texcoords) ;
   normal.w = 0.0 ;
   // unpack and transform into world space normal
   normal.xyz = normal.xyz * 2.0 - vec3(1.0) ;
   normal = uni_Transformation * normal ;
   // pack again
   normal.xyz = normal.xyz * 0.5 + vec3(0.5) ;
   
   gl_FragData[0] = diffuse ; 
   gl_FragData[1] = vec4(normal.xyz, uni_SelfIllumination) ;  
   gl_FragData[2] = vec4(uni_SpecularPower/100.0, uni_SpecularFactor/100.0, 0.0, 0.0) ;
}

void mainSimple()
{
   vec2 texcoords = gl_TexCoord[0].xy ;
   vec4 color = texture2D(uni_Diffuse, texcoords) ;    

   // (!) discard fragment (alpha test)
   if (color.a <= uni_MatOpacity) discard ;
   gl_FragData[0] = color ;
}


void main()
{
   if (uni_Mode == 0) mainRegular() ;
   else if (uni_Mode == 1) mainSimple() ;
}
