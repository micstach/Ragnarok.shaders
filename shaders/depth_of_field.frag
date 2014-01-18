uniform sampler2D uni_Frame ;
uniform sampler2D uni_BluredFrame ;
uniform sampler2D uni_Depth ;
uniform sampler2D uni_Focus ;

uniform int uni_Mode ;

uniform vec2 uni_Size ;
varying vec2 var_TexCoords ;

float radius(float z, float zf)
{
   float a = 5.0 ;
   float f = 10.0 ;
   float D = f / a ;

   zf += f ;
   z += f ;
      
   float b = a * (abs(z - zf) / z) * (f / (zf - f))  ;
   
   return clamp(b, 0.0, 1.0) ;
}   
      
float dof(float z, float zf)
{
   int r = 8 ;
   int s = 8 ;
   vec2 d0 = var_TexCoords + float(-r) * uni_Size ;
   vec2 s0 = float(s) * uni_Size ;
   vec2 t = d0 ;
   
   float zmin = 5000.0 ;
  
   for (int y=-r; y<=r; y+=s)
   {
      for (int x=-r; x<=r; x+=s)
      {
         // todo: in loop clamping
         vec2 tc = clamp(t, 0.01, 0.99) ;
         
         float pz = texture2D(uni_Depth, tc).r ;

         // todo: transform zdepth into linear depth
         float n = 1.0 ;
         float f = 4000.0 ;
         pz = (n * f) / (f - pz * (f - n)) ;
         if (pz <= 1.0) pz = 4000.0 ;
         
         // min kernel depth
         zmin = min(zmin, pz) ;
         
         t.x += s0.x ;
      }
      t.x = d0.x ;
      t.y += s0.y ;
   }   
   
   float depth = z ;
  
   if (zf >= z)
   {
      depth = zmin ;
   }
   else if (z > zf && zf > zmin)
   {
      //float da = clamp((zf - zmin) / 32.0, 0.0, 1.0) ;
      //depth = z * (1.0 - da) + zmin * da ;
      
      float d = clamp((zf - zmin) / 32.0, 0.0, 1.0) ;
      depth = mix(z, zmin, d) ;
   }
   else if (zmin >= zf)
   {
      depth = z ;
   }

   return depth ; 
}
   
void main()
{
   if (uni_Mode == 0) // focus calculation
   {
      /*
      float focus = texture2D(uni_Depth, vec2(0.5, 0.5)).r ;
      float n = 1.0 ;
      float f = 4000.0 ;
      focus = (n*f) / (f - focus * (f - n)) ;
      if (focus <= 1.0) focus = 4000.0 ;
      gl_FragColor = vec4(focus, 0.0, 0.0, 0.01) ;
      */
      gl_FragColor = vec4(4000.0, 0.0, 0.0, 0.01) ;
   }
   else if (uni_Mode == 1) // depth of field
   {
      float focus = texture2D(uni_Depth, vec2(0.5, 0.5)).r ;
      float depth = texture2D(uni_Depth, var_TexCoords).r ;

      float n = 1.0 ;
      float f = 4000.0 ;
      depth = (n*f) / (f - depth * (f - n)) ;
      focus = (n*f) / (f - focus * (f - n)) ;
      
      if (depth <= 1.0) depth = 4000.0 ;
      
      float _dof = dof(depth, focus) ;      
      float radius = radius(_dof, focus) ;
      vec4 color = texture2D(uni_Frame, var_TexCoords) ;
      vec4 bluredColor = texture2D(uni_BluredFrame, var_TexCoords) ;
      gl_FragColor = mix(color, bluredColor, radius) ;
   }      
}
