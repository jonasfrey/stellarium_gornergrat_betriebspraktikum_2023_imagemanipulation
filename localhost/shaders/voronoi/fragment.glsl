precision mediump float;
uniform vec2 o_trn_mouse;
uniform vec2 o_trn_mouse_nor;
uniform vec2 o_scl_canvas;
uniform float n_t_ms;

uniform sampler2D tex;
#define n_tau 6.2831
void main() {
    vec2 o_trn_fc_nor = (gl_FragCoord.xy / o_scl_canvas.xy)-.5;
    const float n_its = 100.;
    float n_dist_max = 0.;
    for(float n_it = 0.; n_it < n_its; n_it+=1.){
        float n_it_nor = n_it / n_its;
        float n_radius = (sin(n_t_ms*0.001+n_it_nor*n_tau*2.)*0.5+.5);
        float n_radians = n_it_nor * n_tau;
        vec2 o_p = vec2(
            sin(n_radians)*n_radius, 
            cos(n_radians)*n_radius 
        );
        float n_dist = length(o_trn_fc_nor-o_p);
        n_dist = 1.-n_dist;
        if(n_dist > n_dist_max){
            n_dist_max = n_dist;
        }
    }
    gl_FragColor = vec4(vec3(n_dist_max), 1.);
}