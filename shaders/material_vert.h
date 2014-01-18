// Ragnarok Exodus 2009
// material (base) vertex shader

uniform mat4 uni_Transformation ; 
uniform float uni_Flipped ;

attribute vec3 attrib_Tangent ;
attribute vec3 attrib_Binormal ;

varying vec3 var_Normal ;

#ifdef NORM
varying vec3 var_Tangent ;
varying vec3 var_Binormal ;
#endif

varying float var_linearDepth ;

#ifdef DIFF2
varying float var_Mix ;
#endif

#ifdef PARA
uniform vec4 uni_ObsPos ;
varying vec3 var_View ;
varying vec3 var_Vertex ;
#endif

#ifdef SKINNING
const int const_BonesCount = 25 ;
uniform mat4 uni_Bones[const_BonesCount] ;
attribute vec4 attrib_BonesInd ;
attribute vec4 attrib_Weights ;
#endif

void main() 
{ 
   #ifdef DIFF2
   var_Mix = gl_Color.r ;
   #endif
   
   gl_TexCoord[0] = gl_MultiTexCoord0 ; 
   
   vec4 Vertex = gl_Vertex ;
   vec4 Normal  = vec4(gl_Normal, 0.0) ;
   
   #ifdef NORM
   vec4 Binormal = vec4(attrib_Binormal, 0.0) ;
   vec4 Tangent = vec4(attrib_Tangent, 0.0) ;
   #endif
   
   #ifdef SKINNING
   {  // mesh skinning
      vec4 V = vec4(0.0,0.0,0.0, 1.0) ;
      vec4 N = vec4(0.0, 0.0, 0.0, 0.0) ;
      vec4 B = vec4(0.0, 0.0, 0.0, 0.0) ;
      vec4 T = vec4(0.0, 0.0, 0.0, 0.0) ;
      {
         vec4 bonesInd = attrib_BonesInd ;
         vec4 bonesWeights = attrib_Weights ;

         // matrix transformation limited to 'rotation'
         // on vectors Normal, Binormal and Tangent
         Normal.w = 0.0 ;
         Binormal.w = 0.0 ;
         Tangent.w = 0.0 ;

         for (int i=0; i<4; i++)
         {
            float weight = bonesWeights.x ;

            if (weight > 0.0)
            {
               int bone = int(bonesInd.x)  ;
         
               mat4 mtx = uni_Bones[bone];
         
               V += (mtx * Vertex) * weight ;    
               N += (mtx * Normal)  ;
               B += (mtx * Binormal) ;
               T += (mtx * Tangent) ;
             }

             bonesWeights = bonesWeights.yzwx ;
             bonesInd = bonesInd.yzwx ;
         }         
      }
      // update Vertex, Normal, Binormal and Tangent
      Vertex = vec4(V.xyz, 1.0) ;
      Normal = N ;
      Binormal = B ;
      Tangent = T ;
   }
   #endif
   
   // transformed (world space) vertex
   vec4 vertex = uni_Transformation * Vertex ; 

   // transformed (world space) normal                   
   var_Normal = (uni_Transformation * Normal).xyz ;

   // normal (texture) component
   #ifdef NORM
   {
      // transformed (world space) binormal and tangent
      var_Binormal = (uni_Transformation * Binormal).xyz ;    
      var_Tangent = (uni_Transformation * Tangent).xyz ;
   }
   #endif

   // flip vertex if in "reflection" context
   vertex.y = uni_Flipped * vertex.y ;

   // parallax view vector
   #ifdef PARA
   {
      var_View.x = -dot(var_Tangent, (uni_ObsPos.xyz - vertex.xyz)) ;
      var_View.y = -dot(var_Binormal, (uni_ObsPos.xyz - vertex.xyz)) ;
      var_View.z = -dot(var_Normal, (uni_ObsPos.xyz - vertex.xyz)) ;  
      var_View = normalize(var_View) ;
      
      var_Vertex = vertex.xyz ;
   }
   #endif
   
   // common part                              
   var_linearDepth = -(gl_ModelViewMatrix * vertex).z ;
   gl_Position = gl_ModelViewProjectionMatrix * vertex ; 
   gl_ClipVertex = vertex ;
}
