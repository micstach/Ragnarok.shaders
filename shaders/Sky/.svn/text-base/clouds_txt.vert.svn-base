uniform float uni_CloudsSize ;
uniform vec2 uni_WindDirection ;
varying vec2 v1 ;
varying vec2 v2 ;
varying vec2 v3 ;
varying vec2 v4 ;
varying vec2 v5 ;
varying vec2 v6 ;
varying vec2 v7 ;
varying vec2 v8 ;

void main()
{
               //gl_TexCoord[0].xy = gl_MultiTexCoord0.xy ;
               vec2 TexCoord = gl_MultiTexCoord0.xy  ;
                vec2 dir = uni_WindDirection ;
                TexCoord *= uni_CloudsSize ;
                v1 = (TexCoord / 256.0) + dir ;
                v2 = (TexCoord / 128.0) + dir ;
                v3 = (TexCoord / 64.0)  + dir ;
                v4 = (TexCoord / 32.0)  + dir ;
                v5 = (TexCoord / 16.0)  + dir ;
                v6 = (TexCoord / 8.0) + dir ;
                v7 = (TexCoord / 4.0) + dir ;
                v8 = (TexCoord / 2.0) + dir ;

	gl_Position    	= ftransform() ;
}
	


