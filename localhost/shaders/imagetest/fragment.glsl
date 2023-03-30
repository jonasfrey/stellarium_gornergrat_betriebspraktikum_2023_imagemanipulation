precision highp float;
uniform vec2 o_trn_mouse;
uniform vec2 o_trn_mouse_nor;
uniform vec2 o_scl_canvas;

uniform sampler2D image1;
void main() {
    vec2 o_trn_fc_nor = gl_FragCoord.xy / o_scl_canvas.xy;
    mediump vec4 o_col = texture2D(image1, o_trn_fc_nor);

    gl_FragColor = vec4(o_col.r, o_col.g, o_col.b, 1.);
}