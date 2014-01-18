
varying vec2 var_TexCoords ;
varying vec3 var_eyeRay ;
uniform mat4 uni_ModelviewTranspose ;

void main()
{
   gl_TexCoord[0] = gl_MultiTexCoord0 ;
   var_TexCoords = gl_Color.xy ;
   
   // calculate eyeRay
   vec3 ep = (gl_TexCoord[0].xyz) ;
   vec4 p = vec4(ep.x, ep.y, -1.0, 0.0) ;
   var_eyeRay = (uni_ModelviewTranspose * p).xyz ;
   
   gl_Position = ftransform() ;
}
