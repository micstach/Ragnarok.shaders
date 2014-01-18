uniform vec3          uni_Center;
varying float c ;
varying vec3 PixelPos ;
void main()
{
	vec3 vertex = gl_Vertex.xyz + uni_Center;
	gl_TexCoord[0] = gl_MultiTexCoord0 ;
        PixelPos = vertex;
                vec4 V = vec4(vertex.xyz, 1.0) ;
               
	gl_Position = gl_ModelViewProjectionMatrix * V  ;

   gl_ClipVertex.xyz = vertex ;
}
	







