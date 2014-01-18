// Ragnarok Exodus 2009 
// ambient occlussion component
uniform sampler2D uni_Normal;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_RndNormals ;

uniform vec3 uni_Sphere[64] ;
uniform vec3 uni_Position ;
uniform vec2 uni_ScreenCoords ;
uniform vec2 uni_Size ;
uniform mat4 uni_ModelviewProjection ;
uniform vec2 uni_ScreenSize ;

varying vec3 var_eyeRay ;
varying vec2 var_TexCoords ;

uniform int uni_EnableSSAO ;
uniform float uni_Power ;

float depth(float z)
{
   float n = 1.0 ;
   float f = 4000.0 ;
   return ((n * f) / (f - z * (f - n))) ;
}

vec3 samples14[14] = vec3[14](vec3(-1,-1,-1) * 0.2, 
                           vec3(1,-1,-1) * 0.2,
                           vec3(-1, 1,-1) * 0.2, 
                           vec3(1, 1,-1) * 0.2,
                           vec3(-1, 1, 1) * 0.2, 
                           vec3(1, 1, 1) * 0.2,
                           vec3(-1,-1, 1) * 0.2, 
                           vec3(1,-1, 1) * 0.2,
                           
                           vec3(-1,0,0) * 0.9,
                           vec3(1,0,0) * 0.9,
                           vec3(0,-1, 0) * 0.9,
                           vec3(0,1, 0) * 0.9,
                           vec3(0,0, -1) * 0.9,
                           vec3(0,0, 1) * 0.9) ;

const float MAX_Z = 4000.0 ;
float ssao(vec4 vertex, vec4 nd, float radius)
{
   float z = depth(nd.w) ;
   // skip sky
   if (z > 3999.0) return 1.0 ; 
 
   radius = 10.0;//mix(0.0, 1.0, z/10.0) ; 
   // radius = clamp(radius, 2.0, 10.0) ;
   radius = radius ;/// length(vec3(1,1,1)) ;
   
   vec3 ep = z * gl_TexCoord[0].xyz ;
   
   int samples = 14;

   int i = 0 ;
   
   nd.rgb = nd.rgb * 2.0 - vec3(1.0) ;
   nd.rgb = normalize(nd.rgb) ;
      
   vec3 rn = texture2D(uni_RndNormals, var_TexCoords * uni_ScreenSize / 64.0).rgb ;
   rn = rn * 2.0 - vec3(1.0) ;
   rn = normalize(rn) ;
   vec2 hs = uni_ScreenCoords * 0.5 ;
   
   float buffDepth[14] ;
   float realDepth[14] ;
   
   for (i=0; i<samples; i++)
   {
      vec3 ray = reflect(samples14[i], rn) ;
      
      //ray *= sign(dot(nd.rgb, ray)) ;

      ray *= radius ;
      
      // (!) apply scaling in sample preprocessing 
      vec3 se = ep + ray ;
      vec2 ss = (se.xy / se.z) * hs + vec2(0.5) ; 
      
      float c = 0.999 ;
      ss = clamp(ss, 1.0 - c, c) ;
      
      buffDepth[i] = depth(texture2D(uni_Depth, ss.xy).r) ;
      realDepth[i] = se.z ;
   } 
   

   float v = 0.0 ; 
   float c = 0.0 ;
   float d = 0.0 ;
   
   for (i=0; i<samples; i++)
   {
      d = max((buffDepth[i] - realDepth[i])/5.0, 0.0) ;
      v += (1.0 - exp(-d * 2.0)) ;
       
      d = max((realDepth[i] - buffDepth[i] + 10.0)/20.0, 0.0) ;
      c += exp(-d * 2.0) ;
   } 
  
   return pow(v/c, uni_Power) ; 
}

float SobelEdge()
{
   vec2 p = var_TexCoords.xy ;
   
   float x = uni_Size.x ;
   float y = uni_Size.y ;
   
   float d00 = texture2D(uni_Depth, p + vec2(-x, -y)).r ;
   float d01 = texture2D(uni_Depth, p + vec2( 0, -y)).r ;
   float d02 = texture2D(uni_Depth, p + vec2( x, -y)).r ;
   
   float d10 = texture2D(uni_Depth, p + vec2(-x, 0)).r ;
   float d11 = texture2D(uni_Depth, p + vec2( 0, 0)).r ;
   float d12 = texture2D(uni_Depth, p + vec2( x, 0)).r ;

   float d20 = texture2D(uni_Depth, p + vec2(-x, y)).r ;
   float d21 = texture2D(uni_Depth, p + vec2( 0, y)).r ;
   float d22 = texture2D(uni_Depth, p + vec2( x, y)).r ;
   
   d00 = depth(d00) ;
   d01 = depth(d01) ;
   d02 = depth(d02) ;
   
   d10 = depth(d10) ;
   d11 = depth(d11) ;
   d12 = depth(d12) ;

   d20 = depth(d20) ;
   d21 = depth(d21) ;
   d22 = depth(d22) ;
   
   float gx = d00 + d01 * 2.0 + d02 - d20 - d21 * 2.0 - d22 ;
   float gy = d00 + d10 * 2.0 + d20 - d02 - d12 * 2.0 - d22 ;
   
   float l = pow(gx * gx + gy * gy, 0.5) ;            
   float threshold = 0.001 ;
   
   //if (l > threshold)
   //{
   //   return 1.0 ;
   //}
   //else return 0.0 ;
   
   return pow(l, 1.0) ;
}

vec3 unpack(vec3 n)
{
   return normalize(n * 2.0 - vec3(1.0)) ;
}

float EdgeDetect()
{
   return SobelEdge() ; 
}

void main()
{
   if (uni_EnableSSAO > 0)
   {   
      vec3 normal = texture2D(uni_Normal, var_TexCoords).rgb ;
      float d = texture2D(uni_Depth, var_TexCoords).r ;
      
      vec4 vertex = vec4(uni_Position + var_eyeRay * depth(d), 1.0) ;
      
      float r = 10.0 ;
      vec4 nd = vec4(normal, d) ;
      
      float output_ = ssao(vertex, nd, r) ;
      
      // output shoud be 8bit (not 32bit)
      gl_FragColor = vec4(vec3(output_), 1.0f) ;
      //gl_FragColor = vec4(nd.rgb, 1.0f) ;

   }
   else
   {
      gl_FragColor = vec4(0.95, 0.95, 0.95, 1.0) ;
   }
}
