varying vec3 var_Vertex ; // vertex position (world space)
varying float var_z ; // linear depth
const vec2 scale = vec2(10.0, 10.0) ;
uniform sampler2D uni_Surface ; 
uniform vec4 uni_Observer ;

// add "zero" vertex for "terrain"
// add "terrain" dimension
// "terrain" - mapping surface for maps like heighfield
// transform real vertex coords into 01 tex coords
// use them for heighfield and other tex where 1-1 maping is required
uniform vec2 uni_MappingRange ;
uniform vec2 uni_MappingZero ;
uniform float uni_gridStep ;

varying vec3 var_N ;
varying float var_H ;

uniform vec3 uni_origin ;
uniform vec3 uni_dx ;
uniform vec3 uni_dy ;
uniform vec3 uni_dz ;

vec4 texture2DCubical(vec2 xy)
{
   return vec4(0,0,0,0) ;
}

vec4 texture2DBilinear(vec2 xy)
{
   const float textureSize = 1024.0 ;
   const float texelSize = 1.0/textureSize ;
   
   vec2 I = fract(xy * textureSize) ;

   vec4 t00 = texture2D(uni_Surface, xy) ;
   vec4 t10 = texture2D(uni_Surface, xy + vec2(texelSize, 0.0)) ;
   vec4 t01 = texture2D(uni_Surface, xy + vec2(0.0, texelSize)) ;
   vec4 t11 = texture2D(uni_Surface, xy + vec2(texelSize, texelSize)) ;
   
   // lerp
   vec4 _t0 = mix(t00, t10, I.x) ;
   vec4 _t1 = mix(t01, t11, I.x) ;
   
   return mix(_t0, _t1, I.y);
}

vec4 normalHeight(vec2 xy)
{
   float d = 1.0 / 1024.0 ;
   float h0 = texture2DBilinear(xy).r ;

   float h1 = texture2DBilinear(xy + vec2(d, 0.0)).r ;
   float h3 = texture2DBilinear(xy + vec2(0.0, d)).r ;
   float h5 = texture2DBilinear(xy + vec2(-d, 0.0)).r ;
   float h7 = texture2DBilinear(xy + vec2(0.0, -d)).r ;

   vec2  slope = vec2(h1 - h5, h3 - h7) ;
   //vec2 _slope = vec2(_h1 - _h5, _h3 - _h7) ;
   float heightScale = 0.025 ;
   
   vec3 normal = vec3(0,0,0) ;
   normal += cross(vec3(0.0, slope.y*heightScale, 2.0 / 1024.0), vec3(2.0 / 1024, slope.x*heightScale, 0.0));

   normal = normalize(normal) ;

   // normal not unit-length   
   return vec4(normal.xyz, h0*10.0f) ;
}

vec3 projectVertex(vec2 vtx)
{
   float d = 2.2 ;
   vec3 dv = vec3(0,0,0) ;
   vec3 o = uni_origin ;
   
   dv += 2.0 * vtx.x * uni_dx ;
   dv += vtx.y * uni_dy ;
   dv += d * uni_dz ;

   float k = -(o.y / dv.y) ;    
                               
   return o + k * dv ;
}

void main()
{
   var_Vertex = projectVertex(gl_Vertex.xy) ;
   //var_Vertex += vec3(uni_Observer.x, 0.0, uni_Observer.z) ;

   vec2 st = vec2(var_Vertex.x, var_Vertex.z) - vec2(-7000, -7000) ;
   st.xy /= vec2(14000) ;
   
   vec4 nh = normalHeight(st) ;

   gl_TexCoord[0].xy = st ;
   gl_TexCoord[1].xy = st ;
   
   var_N = nh.xyz ;
   var_H = nh.w ;
   
   var_Vertex += vec3(0.0, nh.w, 0.0) ;
   
   vec4 vertex = gl_ModelViewMatrix * vec4(var_Vertex, 1.0) ;    
   var_z = -vertex.z ;            
   
   gl_Position = gl_ProjectionMatrix * vertex ;
}
