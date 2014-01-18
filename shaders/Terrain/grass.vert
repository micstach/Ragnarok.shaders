uniform vec4 uni_SunDir ;
uniform mat4 lightMatrix ;
varying float var_z ;
varying float intensity ;
varying vec4 vtxPos ;

void main()
{
      gl_TexCoord[0] = gl_MultiTexCoord0 ;
      vtxPos = gl_Vertex ;
      gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;

      vec4 p = lightMatrix * gl_Vertex ;
      gl_TexCoord[1] = vec4((p.x/p.w) * 0.5 + 0.5, (p.y/p.w) * 0.5 + 0.5, (p.z/p.w) * 0.5 + 0.5, 1.0) ;

      intensity = pow(uni_SunDir.y, 0.5) ;      
      if (intensity < uni_SunDir.w) intensity = uni_SunDir.w ;

      var_z = gl_Position.z ;
      var_z = 1.0 - exp(-var_z / 3000.0) ;

}
