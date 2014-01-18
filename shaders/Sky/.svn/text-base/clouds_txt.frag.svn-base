uniform sampler2D 	uni_NoiseMap ;
uniform float  uni_Density ;
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
               float color ;
               color += texture2D(uni_NoiseMap, v1).a / 2.0;
               color += texture2D(uni_NoiseMap, v2).a / 4.0;
               color += texture2D(uni_NoiseMap, v3).a / 8.0;
               color += texture2D(uni_NoiseMap, v4).a / 16.0;
               color += texture2D(uni_NoiseMap, v5).a / 32.0;
               color += texture2D(uni_NoiseMap, v6).a / 64.0;
               color += texture2D(uni_NoiseMap, v7).a / 128.0;
               color += texture2D(uni_NoiseMap, v8).a / 256.0;
               color -= uni_Density ;
               gl_FragColor =  vec4(color, color, color, 0.75) ;
}
