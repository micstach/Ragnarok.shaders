
// Ragnarok Exodus
// DEPTHMAP PROCEDURES

#ifdef _VERTEX_SHADER 

#ifdef _CSM
uniform vec4 uni_Range ;
uniform int uni_DepthmapEnabled ;
uniform mat4 uni_DepthmapTransform[3] ;
varying float var_z ;

void CSM_TexCoords(int i, vec4 vertex)
{
   if (uni_DepthmapEnabled > 0)
   {
      var_z = -(gl_ModelViewMatrix * vertex).z ;

      {  // high  dsadsds
         vec4 p = uni_DepthmapTransform[0] * vertex ;
         gl_TexCoord[i+0] = vec4((p.x/p.w) * 0.5 + 0.5, 
                                 (p.y/p.w) * 0.5 + 0.5, 
                                 (p.z/p.w) * 0.5 + 0.5, 
                                 1.0) ;
      }
      {  // medium 
         vec4 p = uni_DepthmapTransform[1] * vertex ;
         gl_TexCoord[i+1] = vec4((p.x/p.w) * 0.5 + 0.5, 
                               (p.y/p.w) * 0.5 + 0.5, 
                               (p.z/p.w) * 0.5 + 0.5, 
                               1.0) ;
      }
      {  // low
         vec4 p = uni_DepthmapTransform[2] * vertex ;
         gl_TexCoord[i+2] = vec4((p.x/p.w) * 0.5 + 0.5, 
                               (p.y/p.w) * 0.5 + 0.5, 
                               (p.z/p.w) * 0.5 + 0.5, 
                               1.0) ;
      }
   }   
}
#endif _CSM

vec4 DepthTransform(mat4 depthTransform, vec4 vertex)
{
   vec4 p = depthTransform * vertex ;
   p *= 0.5 ;
   p += 0.5 ;
   p.z -= 0.0005 ;
   p.w = 1.0 ;
   return p ;
}

#endif _VERTEX_SHADER 

#ifdef _FRAGMENT_SHADER

float Shadow1Sample(sampler2DShadow depthTex, vec4 texCoord)
{
   return shadow2DProj(depthTex, texCoord).r ;
}

//#define SIMPLE

float Shadow5Samples(sampler2DShadow depthTex, vec4 tex, float d)
{
   float shadow = shadow2DProj(depthTex, tex).r ;

#ifdef SIMPLE
   return shadow ;
#else SIMPLE
   shadow += shadow2DProj(depthTex, tex + vec4(-d, 0.0, 0.0, 0.0)).r ;
   shadow += shadow2DProj(depthTex, tex + vec4( d, 0.0, 0.0, 0.0)).r ;
   shadow += shadow2DProj(depthTex, tex + vec4(0.0, -d, 0.0, 0.0)).r ;
   shadow += shadow2DProj(depthTex, tex + vec4(0.0,  d, 0.0, 0.0)).r ;
   return (shadow * 0.2) ;
#endif SIMPLE
}

float Shadow(sampler2DShadow depthTex, vec4 texCoord, float samplesCount, float texelSize, float filterSize)
{
   float stepSize = (filterSize * texelSize) / samplesCount ;
   float searchRadius = filterSize * texelSize * 0.5 ;
   vec4  tex = vec4(texCoord.x - searchRadius, texCoord.y - searchRadius, texCoord.z, texCoord.w) ;
   float shadowed = 0.0 ;
   
   for (int i=0; i<int(samplesCount); i++)
   { 
      for (int j=0; j<int(samplesCount); j++)
      {
         shadowed += shadow2DProj(depthTex, tex).r;
         tex.x += stepSize ;
      }
      tex.x = texCoord.x - searchRadius ;
      tex.y += stepSize ;
   }

   return (shadowed / float(samplesCount * samplesCount)) ;
}

// CSM
uniform int uni_DepthmapEnabled ;
uniform sampler2DShadow uni_Depthmap[3] ; 
uniform float uni_DepthmapSize[3] ;
uniform vec4 uni_Range ;
varying float var_z ;

float CSM_Shadow(int i)
{
   float shadow = 1.0 ;

   if (uni_DepthmapEnabled > 0)
   {
      if (var_z < uni_Range.x) 
      {
         shadow = Shadow5Samples(uni_Depthmap[0], gl_TexCoord[i], 1.0/uni_DepthmapSize[0]) ;
      }
      else if (var_z < uni_Range.y)
      {
         shadow = Shadow1Sample(uni_Depthmap[1], gl_TexCoord[i+1]) ;
      }
      else
      {
         shadow = Shadow1Sample(uni_Depthmap[2], gl_TexCoord[i+2]) ;
      }
   }
   
   return shadow ;
}

uniform mat4 uni_DepthmapTransform[3] ;
float CSM_ShadowEye(float z, vec4 vertex)
{
   if (uni_DepthmapEnabled <= 0) return 1.0 ;
   
   if (z < uni_Range.x) 
   {  // close
      vec4 p = uni_DepthmapTransform[0] * vertex ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + 0.495, 1.0) ;
      //float shadow = Shadow5Samples(uni_Depthmap[0], v, 1.0/uni_DepthmapSize[0]) ;
      //float depth = texture2D(uni_Depthmap[0], v).r ;
      return Shadow5Samples(uni_Depthmap[0], v, 1.0/uni_DepthmapSize[0]) ;
   }
   else if (z < uni_Range.y)
   {  // medium
      vec4 p = uni_DepthmapTransform[1] * vertex ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + 0.495, 1.0) ;
      return shadow2DProj(uni_Depthmap[1], v).r ;
   }
   else
   {  // far
      vec4 p = uni_DepthmapTransform[2] * vertex ;
      float oow = 0.5 / p.w ;
      vec4 v = vec4(p.x * oow + 0.5, p.y * oow + 0.5, p.z * oow + 0.495, 1.0) ;
      return shadow2DProj(uni_Depthmap[2], v).r ;
   }
}

float CSM_ShadowX(mat4 modelview, vec4 vertex)
{
   // transform
   vec4 v[3] ;
   
   float z = -(modelview * vertex).z ;

      {  // high  dsadsds
         vec4 p = uni_DepthmapTransform[0] * vertex ;
         v[0] = vec4((p.x/p.w) * 0.5 + 0.5, 
                                 (p.y/p.w) * 0.5 + 0.5, 
                                 (p.z/p.w) * 0.5 + 0.495, 
                                 1.0) ;
      }
      {  // medium 
         vec4 p = uni_DepthmapTransform[1] * vertex ;
         v[1] = vec4((p.x/p.w) * 0.5 + 0.5, 
                               (p.y/p.w) * 0.5 + 0.5, 
                               (p.z/p.w) * 0.5 + 0.495, 
                               1.0) ;
      }
      {  // low
         vec4 p = uni_DepthmapTransform[2] * vertex ;
         v[2] = vec4((p.x/p.w) * 0.5 + 0.5, 
                               (p.y/p.w) * 0.5 + 0.5, 
                               (p.z/p.w) * 0.5 + 0.495, 
                               1.0) ;
      }
   
   float shadow = 1.0 ;

   if (uni_DepthmapEnabled > 0)
   {
      if (z < uni_Range.x) 
      {
         shadow = Shadow5Samples(uni_Depthmap[0], v[0], 1.0/uni_DepthmapSize[0]) ;
      }
      else if (z < uni_Range.y)
      {
         shadow = Shadow1Sample(uni_Depthmap[1], v[1]) ;
      }
      else
      {
         shadow = Shadow1Sample(uni_Depthmap[2], v[2]) ;
      }
   }
   
   return shadow ;
}

#endif _FRAGMENT_SHADER

