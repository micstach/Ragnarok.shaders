
uniform int uni_SkinnedMesh ;
const int const_BonesCount = 25 ;
uniform mat4 uni_Bones[const_BonesCount] ;

attribute vec4 attrib_BonesInd ;
attribute vec4 attrib_Weights ;

uniform mat4 uni_Transformation; 

void main() 
{ 
   vec4 vertex = vec4(0.0, 0.0, 0.0, 1.0) ;

   vec4 bonesInd = attrib_BonesInd ;
   vec4 bonesWeights = attrib_Weights ;
      
   if (uni_SkinnedMesh == 1)
   {
      for (int i=0; i<4; i++)
      {
         float w = bonesWeights.x ;
         
         if (w > 0.0)
         {
            int bone = int(bonesInd.x) ;
            mat4 m = uni_Bones[bone] ;
            
            vertex += ((m * gl_Vertex) * w) ;
         }
         
         bonesWeights = bonesWeights.yzwx ;
         bonesInd = bonesInd.yzwx ;
      }

      vertex.w = 1.0 ;    
   }
   else
   {
      vertex = gl_Vertex ;
   }

   vec4 v = uni_Transformation * vertex ;
   gl_Position = gl_ModelViewProjectionMatrix * v ;
}
