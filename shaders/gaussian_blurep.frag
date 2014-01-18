#version 130

uniform sampler2D uni_Source ;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_Normal ;
uniform int uni_Radius ;
uniform vec2 uni_Step ;

//float Gauss[3] = float[3](0.93, 0.5, 0.1) ;
//#define NORMALIZE (1.0/(0.93 + 2.0 * (0.5 + 0.1)))

float depth(float z)
{
   //float n = 1.0 ;
   //float f = 4000.0 ;
   //return ((n * f) / (f - z * (f - n))) ;

   //float n = 1.0 ;
   //float f = 4000.0 ;
   return 4000.0 / (4000.0 - (z * 3999.0)) ;
}

vec3 unpack(vec3 x)
{
   return x * 2.0 - vec3(1.0) ;
}

void main()
{
   vec4 color = vec4(0.0, 0.0, 0.0, 0.0) ;

   //vec3 n0 = texture2D(uni_Normal, gl_TexCoord[0].xy).rgb ;
   float d0 = texture(uni_Depth, gl_TexCoord[0].xy).r ;
   
   //n0 = unpack(n0) ;
   d0 = depth(d0) ;

   const float eps_nrm = 0.1 ;
   float eps_d = mix(1.0, 10.0, d0/4000.0) ;
   
   float count = 0.0 ;
   int s = uni_Radius ;
   vec2 step = uni_Step ;
   
   for (int x=-s; x<=s; x++)
   {
      vec2 coords = gl_TexCoord[0].xy + x * step ;
         
      float d = depth(texture(uni_Depth, coords).r) ;
         
      float cndD = abs(d - d0) / eps_d ;
         
      float w = exp(-float(cndD * cndD) / 4.0) ;
      color += texture2D(uni_Source, coords) * w ;
      count += w ;
   }

   gl_FragColor = vec4(color.rgb / count,1.0) ;
}
