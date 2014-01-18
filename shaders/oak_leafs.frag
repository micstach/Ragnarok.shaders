uniform sampler2D uni_Diffuse ;
uniform sampler2D uni_Opacity ;
uniform sampler2D depthmap ;

varying vec4 var_Color ;
varying vec4 fog;

uniform float shadowmap ;
uniform vec4 uni_SunDir ;

void main()
{
   vec4 alpha = texture2D(uni_Opacity, gl_TexCoord[0].xy) ;
                if (alpha.a > 0.25)
                {
	         vec4 d =  texture2D(uni_Diffuse, gl_TexCoord[0].xy) ;
        	         d.a = alpha.a ;
                         d.rgb *= var_Color.r ;

                
                /*
                if (shadowmap > 0.0)
                {
                     float depth = gl_TexCoord[2].z ;
                     float tex_depth = texture2D(depthmap, gl_TexCoord[2].xy).r + 0.0025 ;
                 
                    float fColor = 1.0 ; 
                    if (depth > tex_depth) 
                    {
                         fColor = uni_SunDir.w ;   
                    }
                    d.rgb *= fColor  ; 
               }
               */
                          gl_FragColor = d  + fog;
              }
              
}
	



