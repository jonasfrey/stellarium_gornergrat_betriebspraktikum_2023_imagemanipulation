precision highp float;
uniform vec2 o_trn_mouse;
uniform vec2 o_trn_mouse_nor;
uniform vec2 o_scl_canvas;

uniform sampler2D tex;
void main() {
    vec2 o_trn_fc_nor = gl_FragCoord.xy / o_scl_canvas.xy;
    // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    mediump vec2 coord = vec2(gl_FragCoord.x/512.0, 1.0 - (gl_FragCoord.y/512.0));
    mediump vec4 sample = texture2D(tex, coord);
    // gl_FragColor = vec4(sample.b, sample.r, sample.g, 1.0);

    float n = length(o_trn_mouse_nor - o_trn_fc_nor);
    gl_FragColor = vec4(vec3(n), 1.);
    // gl_FragColor = vec4(1., n, 0., 1.);
}