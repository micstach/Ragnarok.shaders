uniform sampler2D uni_texAlpha ; // alpha texture
uniform sampler2D uni_texFar ; // far texture
uniform sampler2D uni_texNear ; // near texture

varying vec3 var_composition ;

uniform float uni_farRepeat ;
uniform float uni_nearRepeat ;

uniform int uni_nearTexture ;
varying float z ;
varying vec3 N ;
varying vec3 pos ;

vec3 Mix(vec3 far, vec3 near)
{
    return (far * (near + 0.25)) ;
}

vec3 Mix2(float k, vec3 far, vec3 near)
{
    return (((1.0-k) * far) + (k * near)) ;
}

vec3 mod(vec3 x, float h, float slope) 
{
   float _i = (x.r + x.g + x.b) / 3.0 ;
      
   
   if (h > 100.0 && slope > 0.85)
   {
      //float _s = (slope - 0.85) / 0.25 ;
      //float _h = (h - 100.0) / 50.0 ;
      //return mix(x, (0.25 + _i) * vec3(151.0/255.0, 171.0/255.0, 131.0/255.0), _s * _h) ;
      return x ;
   }
   else if (h < 100.0)
   {
      float _s = (slope - 0.85) / 0.25 ;
      float _h = (100.0 - h) / 75.0 ;
      return mix(x, (0.5 + _i) * vec3(0.95, 0.95, 0.8), _h) ;
   }      
   else
   {
      return x ;
   }
}

void main()
{
   vec3 color_far = var_composition.x * texture2D(uni_texFar, gl_TexCoord[1].xy * uni_farRepeat).rgb ;
   color_far += var_composition.y * texture2D(uni_texFar, gl_TexCoord[2].xy * uni_farRepeat).rgb ;
   color_far += var_composition.z * texture2D(uni_texFar, gl_TexCoord[3].xy * uni_farRepeat).rgb ;  

   vec3 color_near = vec3(0.75, 0.75, 0.75) ;

   if (uni_nearTexture == 1)
   {
      color_near = var_composition.x * texture2D(uni_texNear, gl_TexCoord[1].xy * uni_nearRepeat).rgb ;
      color_near += var_composition.y * texture2D(uni_texNear, gl_TexCoord[2].xy * uni_nearRepeat).rgb ;
      color_near += var_composition.z * texture2D(uni_texNear, gl_TexCoord[3].xy * uni_nearRepeat).rgb ;
   }

   vec3 color = Mix2(0.75, color_far, color_near)  ;  

   // R&D color modifiaction based on height and slope
   // color = mod(color, pos.y, N.y) ;                                
   
   float layerMask = texture2D(uni_texAlpha, gl_TexCoord[0].xy).a ;

   // pack normal
   vec3 normal = N * 0.5 + vec3(0.5) ;
      
   gl_FragData[0] = vec4(color, layerMask) ;
   gl_FragData[1] = vec4(normal, 0.0) ;
   gl_FragData[2] = vec4(0.0, 0.0, 0.0, 0.0) ;
}
	

