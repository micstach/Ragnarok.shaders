uniform sampler2D uni_SrcTex ;
uniform vec2 uni_SrcTexSize ;

void main()
{
   gl_FragColor = texture2D(uni_SrcTex, gl_TexCoord[0].xy) ;

   /*
   float d = texture2D(uni_SrcTex, gl_TexCoord[0].xy).w ;
   const int r = 0 ;
   
   float m1 = 0.0 ; // mean depth
   float m2 = 0.0 ; // mean squared depth
   
   for (int y=-r; y<=r; y++)
   {
      for (int x=-r; x<=r; x++)
      {
         vec4 nd = texture2D(uni_SrcTex, gl_TexCoord[0].xy + vec2(float(x), float(y)) * uni_SrcTexSize.xy) ;
         
         m2 += nd.w * nd.w ;
         m1 += nd.w ;
      }
   }
   
   // number of elements in kernel
   // (r+1) * (r+1)
   
   float k = 1.0 / float((r+1) * (r+1)) ;
   m1 *= k ;
   m2 *= k ;
   
   // 
   // x = E(x)
   // y = E(x2)
   // z = E(x2) - E(x)2 
   // w = depth ;
   gl_FragColor = vec4(m1, m2, m2 - m1 * m1, d) ;//texture2D(uni_SrcTex, gl_TexCoord[0].xy) ;
   */   
   
   /*
   float d = texture2D(uni_SrcTex, gl_TexCoord[0].xy).w ;
   
   // 
   // x = E(x) = d
   // y = E(x2) = d * d
   // z = E(x2) - E(x) = d * d - d * d = 0  
   // w = depth ;
   gl_FragColor = vec4(d, d*d, 0.0, d) ;//texture2D(uni_SrcTex, gl_TexCoord[0].xy) ;
   */
}
