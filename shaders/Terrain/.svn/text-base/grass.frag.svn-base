uniform vec4 uni_SunDir ;
uniform vec4 uni_ObsPos ;
varying vec4 vtxPos ;

uniform sampler2D grass ;
uniform sampler2D grass_a ;
uniform sampler2DShadow depthmap ; // static depth map

varying float var_z ;
varying float intensity ;

uniform float shadowmap ; // enable|disable

float bias = 0.002 ;
int blockerSamples = 3 ;
float blockerFilterSize = 128.0 ;
int pcfSamples = 3 ;
uniform float uni_LightSize ;

/*
float BlockerDepth(vec4 texCoord, int samplesCount, float ref_depth, float filterSize)
{
   float stepSize = (filterSize * texelSize) / (samplesCount-1) ;
   float searchRadius = filterSize * texelSize * 0.5 ;

   vec2  tex = vec2(texCoord.x - searchRadius, texCoord.y - searchRadius) ;
   
   float  shadowed = 0.0 ;

   float blockerDepth = 0.0 ;
   float blockerCount = 0.0 ;

   for (int i=0; i<samplesCount; i++)
   { 
      for (int j=0; j<samplesCount; j++)
      {
         float depth = texture2DProj(depthmap, tex).r + bias ;
         if (ref_depth >= depth)
         {
             blockerCount += 1.0 ;
             blockerDepth += depth ;
         }
         tex.x += stepSize ;
      }
      tex.x = texCoord.x - searchRadius ;
      tex.y += stepSize ;
   }
   
   if (blockerCount > 0.0)
   {
         blockerDepth = blockerDepth / blockerCount ;
    }
    else
    {
         blockerDepth = -1.0 ;
    }
   return blockerDepth ;
}
*/

float PCF(sampler2DShadow depthTex, vec4 texCoord, int samplesCount, float texelSize, float filterSize)
{
   float stepSize = (filterSize * texelSize) / (samplesCount-1) ;
   float searchRadius = filterSize * texelSize * 0.5 ;
   vec4  tex = vec4(texCoord.x - searchRadius, texCoord.y - searchRadius, texCoord.z, texCoord.w) ;
   float shadowed = 0.0 ;
   
   for (int i=0; i<samplesCount; i++)
   { 
      for (int j=0; j<samplesCount; j++)
      {
         if (shadow2DProj(depthTex, tex).r < 0.5)
         {
            shadowed += 1.0 ;
         }
         tex.x += stepSize ;
      }
      tex.x = texCoord.x - searchRadius ;
      tex.y += stepSize ;
   }

   return (1.0 - (shadowed / (samplesCount * samplesCount))) ;
}

float PCFSimple(sampler2DShadow depthTex, vec4 texCoord)
{
    return shadow2DProj(depthTex, texCoord).r ;
}


float Shadow(sampler2DShadow depthTex, vec4 texCoord, float texelSize)
{
       return PCF(depthTex, texCoord, 1, texelSize, 2.0 ) ;
 }


void main()
{
       float _alpha = texture2D(grass_a, gl_TexCoord[0].xy).a ;
       //if (_alpha > 0.25)
       {
          vec4 color = texture2D(grass,gl_TexCoord[0].xy) ;
          if (shadowmap > 0.0)
          { 
             float ambient = 0.75 ;
              float i = shadow2DProj(depthmap, gl_TexCoord[1]).r ; //PCFSimple(depthmap, gl_TexCoord[1])  ;
              i = ambient + (1.0 - ambient) * i ;
              color.rgb *= i ; 
           }

           color.rgb *= intensity ;
           color.a = _alpha ;
           gl_FragColor = color ;
           gl_FragColor += vec4(var_z * 0.5, var_z * 0.5, var_z, 0.0) ;
       }
}
