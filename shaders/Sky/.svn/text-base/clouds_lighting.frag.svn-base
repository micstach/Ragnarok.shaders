uniform sampler2D uni_CloudsMap ;             // cloud map
uniform float uni_SunX ;                      // sun position
uniform float uni_SunY ;                      // ...
uniform float uni_SunZ ;                      // ...
uniform vec4 uni_SunDir ;
uniform float uni_TextureSize ;           // we use square textures
uniform float uni_CoefAbsorption ;     // cloud absorption coeficient

void main()
{
        float shadow_color = 1.0 ;
        float background_color = 1.0 ;
        float z1 = -texture2D(uni_CloudsMap, gl_TexCoord[0].xy).r ;

        float absorption = uni_CoefAbsorption  ; 
      
        if (uni_SunDir.y < 0.0)
        {
           absorption = 50.0 ;        
        }
        
                 
        if (z1 != 0.0) 
        {
                float z2 = uni_SunZ ;
                vec2 Point = gl_TexCoord[0].xy ;
                vec2 End = vec2(uni_SunX, uni_SunY) ;
                float voxel_in_shadow   = 0.0 ;
                vec2 D = End - Point ;  

                int steps = int(uni_TextureSize * max(abs(D.x), max( abs(D.y), abs(z2-z1) ))) ;
                float  dz = (z2 - z1) / float(steps) ; 
                D = D / float(steps) ;
                  
                 float VoxelVal ;

	 for (int i=0;
                       (i<steps)  && 
                       (0.0 <= Point.x && Point.x <=1.0) &&
                       (0.0 <= Point.y && Point.y <=1.0) &&
                       (-1.0 <= z1 && z1 <=1.0); 
                       i++)
                {
           	       VoxelVal = texture2D(uni_CloudsMap, Point).r;

	       if ( -VoxelVal <= z1)
                       {
                                if(z1 <= VoxelVal) 
        	                {        
	                           voxel_in_shadow += absorption  ;
        	                }
                       }

                        Point = Point + D ;
                        z1 += dz ;
               }
              shadow_color =  exp(-voxel_in_shadow)  ;

              ////////////////////////////////////////////////////////////////////////////////////////////////////////
              // transmitted background light
              Point   = gl_TexCoord[0].xy ;
              End     = Point + (Point - vec2(0.5, 0.5)) ;
              D         = End - Point ;  
              z1        = -texture2D(uni_CloudsMap, gl_TexCoord[0].xy).r ;
              z2        = z1 + (z1 - (-1.0)) ;
              steps   = int(uni_TextureSize * max( abs(D.x) , max( abs(D.y) ,  abs(z2-z1) )));
              dz        = (z2 - z1) / float(steps);
              D = D / float(steps);
                
              VoxelVal = 0.0 ;
              for (int i=0;
                       (i<steps)  && 
                       (0.0 <= Point.x && Point.x <=1.0) &&
                       (0.0 <= Point.y && Point.y <=1.0) &&
                       (-1.0 <= z1 && z1 <=1.0); 
                       i++)
                {
           	       VoxelVal = texture2D(uni_CloudsMap, Point).r;

	       if ( -VoxelVal <= z1)
                       {
                                if(z1 <= VoxelVal) 
        	                {         // cloud extinction
	                           voxel_in_shadow += absorption ;
        	                }
                       }

                        Point = Point + D ;
                        z1 += dz ;
               }
              background_color =  exp(-voxel_in_shadow)  ;

              ////////////////////////////////////////////////////////////////////////////////////////////////////////
              // phase function
              vec3 obs = vec3(0.5, 0.5, -2.0) ;
              vec3 sun = vec3(uni_SunX, uni_SunY, uni_SunZ) ;
              vec3 prt  = vec3(gl_TexCoord[0].xy, -texture2D(uni_CloudsMap, gl_TexCoord[0].xy).r) ;
              
              vec3 v1   = obs - prt ;
              vec3 v2   = sun - prt ;
          
              float cos_alpha = dot(v1, v2) / (length(v1) * length(v2)) ;
              //float phase = /*(3.0 / 16) * ( 1 +*/ (cos_alpha * cos_alpha);//) ;              
              float phase = (3.0 / 16.0) * pow(cos_alpha * cos_alpha, 16.0);
              //shadow_color += phase ;//* background_color ;
              background_color = phase* (background_color);
              
       }


       // we could use only two componenets or use additional two for further extension
       gl_FragColor = vec4(shadow_color, background_color, shadow_color,  0.5) ;
}
