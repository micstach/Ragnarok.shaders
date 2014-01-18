
uniform sampler2D uni_Noise ;

uniform vec2 uni_Translate ;
varying vec3 var_Position ;

const float d = 1.0 / 1024.0 ;

vec4 noise4(vec2 t)
{
   vec4 n = texture2D(uni_Noise, t) ;
   return vec4(pow(n.r, 2.0)) ; 
}

float noise1(vec2 t)
{
   float n = texture2D(uni_Noise, t).r ;
   return pow(n, 2.0) ; 
}

vec4 tex2DBi(vec2 xy, float textureSize)
{
   //return texture2D(uni_Noise, xy) ;

   float texelSize = 1.0/textureSize ;
   
   vec2 I = fract(xy * textureSize) ;
   
   xy = floor(xy * textureSize) / textureSize ;
   
   vec4 t00 = texture2D(uni_Noise, xy) ;
   vec4 t10 = texture2D(uni_Noise, xy + vec2(texelSize, 0.0)) ;
   vec4 t01 = texture2D(uni_Noise, xy + vec2(0.0, texelSize)) ;
   vec4 t11 = texture2D(uni_Noise, xy + vec2(texelSize, texelSize)) ;
   
   // lerp
   vec4 _t0 = mix(t00, t10, I.x) ;
   vec4 _t1 = mix(t01, t11, I.x) ;
   
   
   return mix(_t0, _t1, I.y) ;
   
}


void main()
{
   //vec2 p = var_Position.xy ;
   vec2 t = vec2(uni_Translate.x, 0.0) * 0.4 ;
   vec2 c = gl_TexCoord[0].xy  ;
      
   float p0 = tex2DBi(c + t, 1024.0).r ;
   float p1 = tex2DBi(c/2.0 + t, 1024.0 * 2.0).r ;
   float p2 = tex2DBi(c/4.0 + t, 1024.0 * 4.0).r ;
   float p3 = tex2DBi(c/8.0 + t, 1024.0).r ;
   float p4 = tex2DBi(c/16.0 + t*2.0, 1024.0 * 16.0).r ; 
   
   float f = 0.0 ;
   float w = 0.0 ;
   float p = 0.5 ;
   
   p0 = pow(p0, 2.0) ;
   p1 = pow(p1, 2.0) ;
   p2 = pow(p2, 2.0) ;
   p3 = pow(p3, 2.0) ;
   p4 = pow(p4, 2.0) ;
   
   f += p4 * pow(p, 1.0); w += pow(p, 1.0);
   f += p3 * pow(p, 3.0) ; w += pow(p, 3.0) ;
   f += p2 * pow(p, 4.0) ; w += pow(p, 4.0) ;
   f += p1 * pow(p, 5.0) ; w += pow(p, 5.0) ;
   f += p0 * pow(p, 6.0) ; w += pow(p, 6.0) ;
      
   f = f / w ;
   gl_FragColor = vec4(f, f, f, 1.0) ;
}
