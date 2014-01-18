uniform float uni_FlipY ;
varying vec3 var_composition;
uniform float uni_terrainSize ;
varying float z ;
varying vec3 N ;
varying vec3 pos ;

void main()
{
   z = -(gl_ModelViewMatrix * gl_Vertex).z ;
   gl_Position = ftransform() ; 
   N = gl_Normal ;        
   float nx = pow(abs(gl_Normal.x), 16.0) ;
   float ny = pow(abs(gl_Normal.y), 16.0) ;              
   float nz = pow(abs(gl_Normal.z), 16.0) ;

   var_composition = vec3(nx, ny, nz) ;
   var_composition /= (nx + ny + nz)  ; 

   vec4 vtx = gl_Vertex / uni_terrainSize ;
   
   gl_TexCoord[0] = gl_MultiTexCoord0 ;
   gl_TexCoord[1].xy = vec2(vtx.y, vtx.z) ;
   gl_TexCoord[2].xy = vec2(vtx.x, vtx.z) ;        
   gl_TexCoord[3].xy = vec2(vtx.x, vtx.y) ;
   
   vec4 vertex = gl_Vertex ;
   pos = vertex.xyz ;
   vertex.y = uni_FlipY * vertex.y ;

   gl_ClipVertex = vertex ;
}
