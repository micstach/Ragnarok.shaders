varying vec3 PixelPos ;
uniform vec3 uni_ObsPos ;
void main()
{
	PixelPos 	                = gl_Vertex.xyz;

                vec4 vertex = vec4(gl_Vertex.xyz + uni_ObsPos, 1.0) ;
	gl_TexCoord[0] 	= gl_MultiTexCoord0 ;
	gl_Position    	= gl_ModelViewProjectionMatrix * vertex ;

   gl_ClipVertex = vertex ;
}
	


