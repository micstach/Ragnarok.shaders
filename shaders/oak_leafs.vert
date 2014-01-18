uniform mat4    uni_Transformation;
uniform vec3    uni_CamX ;
uniform vec3    uni_CamY ;
uniform float    uni_Scale ;
uniform float    uni_Time ;
uniform float uni_FogPower;
attribute vec2  attrib_Coords ;
varying vec4    var_Color ;

varying vec4 fog;

uniform mat4 lightMatrix ;

void main()
{
       var_Color = gl_Color ;
       vec3  vertex = (uni_Transformation * gl_Vertex).xyz ;
       vertex += uni_Scale * uni_CamX * attrib_Coords.x ;      
       vertex += uni_Scale * uni_CamY * attrib_Coords.y ;      
       vec4 Vertex = vec4(vertex, 1.0) ;
       //Vertex.xyz += uni_CamX.xyz * 0.5 * sin(uni_Time + Vertex.x) ;
       gl_TexCoord[0] = vec4(gl_MultiTexCoord0.x, gl_MultiTexCoord0.y, 1.0, 1.0) ;
       //gl_TexCoord[1] = vec4(gl_MultiTexCoord1.x, gl_MultiTexCoord1.y, 1.0, 1.0) ;	
       gl_Position    = gl_ModelViewProjectionMatrix * Vertex  ;

   // fog coefficient
   if (uni_FogPower != 0.0)
   {
       float fog_value = -gl_Position.w ;
       fog_value =  (1.0-exp(fog_value/3000.0)) * uni_FogPower; 
       fog = vec4(fog_value * 0.5, fog_value * 0.5, fog_value, 0.0) ;
   }
   else
   {
       fog = vec4(0.0,0.0,0.0,0.0) ;
   }
       // vec4 p = lightMatrix * Vertex ;
       // gl_TexCoord[2] = vec4((p.x/p.w) * 0.5 + 0.5, (p.y/p.w) * 0.5 + 0.5, (p.z/p.w) * 0.5 + 0.5, 1.0) ;
        
}



