// Ragnarok Exodus 2009
// material (base) fragment shader
uniform int uni_Mode ;

#define PACK_NORMAL

#ifdef DIFF
uniform sampler2D uni_Diffuse ;
#endif

#ifdef TRANSPARENCY
uniform float uni_Transparency ;
#endif

#ifdef DIFF2
uniform sampler2D uni_Diffuse ;
uniform sampler2D uni_Diffuse2 ;
varying float var_Mix ;
#endif

#ifdef OPAC
uniform float uni_MatOpacity ;
uniform sampler2D uni_Opacity ;
#endif

#ifdef NORM
uniform sampler2D uni_Normal ;
#endif

#ifdef SPEC
uniform sampler2D uni_Specular ;
#endif

#ifdef SPEC2
uniform sampler2D uni_Specular ;
uniform sampler2D uni_Specular2 ;
#endif

#ifdef PARA
uniform sampler2D uni_Height ;
uniform float uni_BumpScale ;
varying vec3 var_Vertex ;
varying vec3 var_View ;
#endif
 
// general material uniforms
uniform float uni_Glossiness ;
uniform float uni_SpecularLevel ;
uniform float uni_Backlight ;
uniform float uni_SelfIllumination ;

varying vec3 var_Normal ;
varying vec3 var_Tangent ;
varying vec3 var_Binormal ;

varying float var_linearDepth ;

#ifdef PARA
float level = 0.0 ;

float mipmapLevel()
{
   return mix(0.0, 8.0, var_linearDepth * 0.00005) ;
}

vec2 ParallaxOffset(float mipmap)
{
   vec3 view = var_View ;
   float texelSize = 1.0 / 512.0 ;

   float steps = 2.0 * (9.0 - mipmap) ; // steps from 0 to 16.0
   float l = abs(view.z) ;
   
   float scale = uni_BumpScale ;
   
   vec3 stepUV = (scale * view) / (l * steps)  ;

   stepUV.xy *= texelSize ;
   
        
   int i = 0 ; 
   vec3 deltaUV = vec3(gl_TexCoord[0].xy, 0.0) ;
   
   // do numer of steps
   while (i < int(steps))
   {
      float height = scale * (texture2DLod(uni_Height, deltaUV.xy, mipmap).a - 1.0) ;
      
      if (height < deltaUV.z)
      {
         deltaUV += stepUV ;
      }
      else 
      {
         // go one step back 
         // and start again searching - for precise intersection
         deltaUV -= stepUV ;
         stepUV *= 0.5 ;
      }
      i++ ;
   } 

   return (deltaUV.xy - gl_TexCoord[0].xy) ;  
}
#endif

#ifdef PARA
#define TEXTURE2D(x, y) texture2DLod(x, y, level) 
#else
#define TEXTURE2D(x, y) texture2D(x, y) 
#endif

void mainRegular()
{
   vec2 texcoords = gl_TexCoord[0].xy ;

   // opacity component
   // - disabled with default value '1.0' 
   float opacity = 1.0 ;
   #ifdef OPAC
   {
      // (!) may opacity pass have higher priority than
      //     parallax calculation (may be incorrect)
      opacity = TEXTURE2D(uni_Opacity, texcoords).a ;

      // (!) discard fragment (alpha test)
      const float bias = 0.0001 ;
      if (opacity <= (uni_MatOpacity - bias)) discard ; 		      
   }
   #endif

   float height = 0.0 ;
   #ifdef PARA
   {
      level = mipmapLevel() ;
      texcoords += ParallaxOffset(level) ;
      height = TEXTURE2D(uni_Height, texcoords).a ;
   }
   #endif
   
   // general setup
   float glossiness = uni_Glossiness / 100.0 ;
   float specularLevel = uni_SpecularLevel / 100.0 ;
   
   // diffuse (texture) component
   vec3 diffuse = vec3(1.0, 1.0, 1.0) ;
   #ifdef DIFF
   {
      diffuse = TEXTURE2D(uni_Diffuse, texcoords).rgb ;
   }
   #endif
   
   #ifdef DIFF2
   {
      diffuse = TEXTURE2D(uni_Diffuse, texcoords).rgb ;
      vec3 diffuse2 = TEXTURE2D(uni_Diffuse2, texcoords).rgb ;
      diffuse = mix(diffuse, diffuse2, var_Mix) ; 
   }
   #endif 
   
   // normal component
   vec3 normal = var_Normal ;
   #ifdef NORM 
   {
      vec3 texN = TEXTURE2D(uni_Normal, texcoords).rgb ;
      texN = (2.0 * texN) - vec3(1.0) ;
      normal = mat3(var_Tangent, -var_Binormal, var_Normal) * texN ;
   }
   #endif 
  
   // additional processing of normal in case of twosided objects
   #ifdef OPAC
   {
      // modify normal
      if (!gl_FrontFacing) 
      {
         normal = -normal ;
      }      
   }
   #endif
   
   #ifdef PACK_NORMAL
   {
      normal = (normal * 0.5) + vec3(0.5) ;
   }
   #endif
   
   // (base) specular component
   #ifdef SPEC
   {
      specularLevel *= TEXTURE2D(uni_Specular, texcoords).a ;

      // second specular component
      #ifdef SPEC2
      {
         specularLevel *= TEXTURE2D(uni_Specular2, texcoords).a ;
      }
      #endif   
   }
   #endif

   #ifdef TRANSPARENCY
      opacity = uni_Transparency ;
   #endif  
    
   // diffuse and opacity
   gl_FragData[0] = vec4(diffuse, opacity) ;
   // normal and self illumination
   gl_FragData[1] = vec4(normal, uni_SelfIllumination) ; 
   // specular and backlight contribution
   gl_FragData[2] = vec4(glossiness, specularLevel, uni_Backlight, /*not used*/ 0) ;
}

void mainSimple()
{
   // opacity component
   // - disabled with default value '1.0' 
   float opacity = 1.0 ;
   #ifdef OPAC
   {
      vec2 texcoords = gl_TexCoord[0].xy ;

      opacity = TEXTURE2D(uni_Opacity, texcoords).a ;
      // (!) discard fragment (alpha test)
      if (opacity <= uni_MatOpacity) discard ;
   }
   #endif
   
   // diffuse and opacity
   gl_FragData[0] = vec4(1.0, 1.0, 1.0, opacity) ;
}

void main()
{
   if (uni_Mode == 0) mainRegular() ;
   else if (uni_Mode == 1) mainSimple() ;
}