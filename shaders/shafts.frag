uniform vec4 uni_SunDir ;
uniform vec4 uni_ObsPos ;
uniform vec4 uni_ViewDir ;

uniform int uni_DepthmapEnabled ;
uniform sampler2DShadow uni_Depthmap ;

varying vec3 var_Vertex ;

float PCF(sampler2DShadow depthTex, vec4 texCoord)
{
   return shadow2DProj(depthTex, texCoord).r ;
}

/*
float PCF(sampler2DShadow depthTex, vec4 texCoord, int samplesCount, float texelSize, float filterSize)
{
   float stepSize = (filterSize * texelSize) / float(samplesCount) ;
   float searchRadius = filterSize * texelSize * 0.5 ;
   vec4  tex = vec4(texCoord.x - searchRadius, texCoord.y - searchRadius, texCoord.z, texCoord.w) ;
   float shadowed = 0.0 ;
   
   for (int i=0; i<samplesCount; i++)
   { 
      for (int j=0; j<samplesCount; j++)
      {
         if (shadow2DProj(depthTex, tex).r < 1.0)
         {
            shadowed += 1.0 ;
         }
         tex.x += stepSize ;
      }
      tex.x = texCoord.x - searchRadius ;
      tex.y += stepSize ;
   }

   return (1.0 - (shadowed / float(samplesCount * samplesCount))) ;
}
*/

void main()
{
   float a = 1.0/64.0 ;
   vec4 diffuse = vec4(a, a, a, 1.0) ;

   if (uni_DepthmapEnabled > 0)
   { 
      float s = PCF(uni_Depthmap, gl_TexCoord[0]) ;//, 1, 1.0/2048.0, 1.0) ; 
      diffuse.rgb *= s ;
   }
 
   // vec3 view = normalize(var_Vertex - uni_ObsPos.xyz) ;
   //float scale = dot(-uni_ViewDir.xyz, uni_SunDir.xyz) ;
   //if (scale < 0.0) scale = 0.0 ;
   // final frag color 
   gl_FragColor = diffuse ; 
}
