console.log("client run!")

import {f_o_html_from_o_js} from "https://deno.land/x/f_o_html_from_o_js@0.7/mod.js";

var o_canvas = document.createElement("canvas");
var f_resize_canvas = function(o_canvas){

    o_canvas.width = o_canvas.parentElement.clientWidth;
    o_canvas.height = o_canvas.parentElement.clientHeight;
}
document.body.appendChild(o_canvas);

f_resize_canvas(o_canvas);

window.onresize = function(){
    f_resize_canvas(o_canvas);
}


let f_o_shader_compiled = function(
    o_gl,
    s_shader_sourcecode,
    n_gl_shader_type
) {
    var o_shader_compiled = o_gl.createShader(n_gl_shader_type);
    o_gl.shaderSource(o_shader_compiled, s_shader_sourcecode);
    o_gl.compileShader(o_shader_compiled);
    if (!o_gl.getShaderParameter(o_shader_compiled, o_gl.COMPILE_STATUS)) {
        alert("Error compiling shader: " + o_gl.getShaderInfoLog(o_shader_compiled));
        return;
    }
    return o_shader_compiled;
}

// Init WebGL context

const o_gl = o_canvas.getContext("webgl2");

let f_switch_programm = async function(
    s_shader_name, 
    o_gl
){
    // console.log(s_shader_name)
    // var s_shader_name = 'imagetest';

    var s_source_code_glsl_vertex = (await(await fetch(`./shaders/${s_shader_name}/vertex.glsl`)).text());
    var s_source_code_glsl_fragment = (await(await fetch(`./shaders/${s_shader_name}/fragment.glsl`)).text());

    var o_shader_compiled__vertex = f_o_shader_compiled(o_gl, s_source_code_glsl_vertex, o_gl.VERTEX_SHADER);
    var o_shader_compiled__fragment = f_o_shader_compiled(o_gl, s_source_code_glsl_fragment, o_gl.FRAGMENT_SHADER);

    // Create program
    var o_gl_program = o_gl.createProgram();

    // Attach and link shaders to the program
    o_gl.attachShader(o_gl_program, o_shader_compiled__vertex);
    o_gl.attachShader(o_gl_program, o_shader_compiled__fragment);
    o_gl.linkProgram(o_gl_program);
    if (!o_gl.getProgramParameter(o_gl_program, o_gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program");
        // return false;
    }

    // Use program
    o_gl.useProgram(o_gl_program);
    o_gl.program = o_gl_program;

    // Vertices
    var n_dimensions = 3;
    var a_n_vertex_axisvalue = new Float32Array([// [ x, y, z, x, y, z, ...]
        //x    y     z 
        -1.0, +1.0, +0.0, // first triangle
        -1.0, -1.0, +0.0,
        +1.0, -1.0, +0.0,

        -1.0, +1.0, +0.0, // second triangle
        +1.0, -1.0, +0.0,
        +1.0, +1.0, +0.0
    ]);
    o_gl.a_n_vertex_axisvalue = a_n_vertex_axisvalue;

    // Create a buffer object
    var o_buffer__vertex = o_gl.createBuffer();
    if (!o_buffer__vertex) {
        console.log('Failed to create the buffer object');
        // return -1;
    }
    o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buffer__vertex);
    o_gl.bufferData(o_gl.ARRAY_BUFFER, a_n_vertex_axisvalue, o_gl.STATIC_DRAW);

    // Assign the a_n_vertex_axisvalue in buffer object to o_position variable
    var o_attrloc__o_position = o_gl.getAttribLocation(o_gl.program, 'o_position');
    if (o_attrloc__o_position < 0) {
        console.log('Failed to get the storage location of o_position');
        // return -1;
    }
    o_gl.vertexAttribPointer(o_attrloc__o_position, n_dimensions, o_gl.FLOAT, false, 0, 0);
    o_gl.enableVertexAttribArray(o_attrloc__o_position);

    // Return number of a_n_vertex_axisvalue
    var n = a_n_vertex_axisvalue.length / n_dimensions;

    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        // return;
    }

    // add uniform at init time
    o_gl.o_uniform_locations = {
        o_uniform_location__o_trn_mouse : o_gl.getUniformLocation(o_gl.program, "o_trn_mouse"),
        o_uniform_location__o_trn_mouse_nor : o_gl.getUniformLocation(o_gl.program, "o_trn_mouse_nor"),
        o_uniform_location__o_scl_canvas : o_gl.getUniformLocation(o_gl.program, "o_scl_canvas"),
        o_uniform_location__n_t_ms : o_gl.getUniformLocation(o_gl.program, "n_t_ms"),
    };
    



}
await f_switch_programm('voronoi', o_gl);

var s_html = (await(await fetch("./shaders")).text());
var o_div = document.createElement("div");
o_div.innerHTML = s_html;
var a_s_shader_name = Array.prototype.slice.call(o_div.querySelectorAll("a")).filter(o=>o.getAttribute("href") != '..').map(o=>o.getAttribute("href").replaceAll("/", ''))
var o_select = f_o_html_from_o_js(
    {
        class: "gui",
        a_o: [
            {
                s_tag:"select", 
                onchange : async function(){
        
                    await f_switch_programm(this.value, o_gl);
                },
                a_o: [
                    ...a_s_shader_name.map(
                        function(s){
                            return {
                                s_tag:'option', 
                                value: s,
                                innerText: s
                            }
                        }
                    )
                ]
            }
        ]
    }
)
document.body.appendChild(o_select);


// load image
const img = new Image();
img.onload = function() {
  o_gl.activeTexture(o_gl.TEXTURE0);
  const image1 = o_gl.createTexture();
  o_gl.bindTexture(o_gl.TEXTURE_2D, image1);
  o_gl.texImage2D(o_gl.TEXTURE_2D, 0, o_gl.RGB, o_gl.RGB, o_gl.UNSIGNED_BYTE, img);
  o_gl.generateMipmap(o_gl.TEXTURE_2D);

  const texLoc = o_gl.getUniformLocation(o_gl.program, "image1");
  o_gl.uniform1i(texLoc, 0);

  o_gl.drawArrays(o_gl.TRIANGLE_FAN, 0, 4);  // draw over the entire viewport
};
img.src = './image1.jpg';




var a_n_axisval__mouse = [0,0];
var a_n_axisval__mouse_nor = [0,0];
o_canvas.onmousemove = function(){
    var o_rect = o_canvas.getBoundingClientRect();
    var x = window.event.clientX - o_rect.left; //x position within the element.
    var y = window.event.clientY - o_rect.top;  //y position within the element.
    y = o_rect.height - y;
    a_n_axisval__mouse[0] = x;
    a_n_axisval__mouse[1] = y;
    a_n_axisval__mouse_nor[0] = x / o_rect.width;
    a_n_axisval__mouse_nor[1] = y / o_rect.height;
    
}

let f_render__recursive = function(o_gl){
    requestAnimationFrame(function(){
        f_render__recursive(o_gl)
    });
    o_gl.uniform2fv(
        o_gl.o_uniform_locations.o_uniform_location__o_trn_mouse,
        a_n_axisval__mouse
    );
    o_gl.uniform2fv(
        o_gl.o_uniform_locations.o_uniform_location__o_trn_mouse_nor,
        a_n_axisval__mouse_nor
    );
    // console.log(a_n_axisval__mouse_nor)
    o_gl.uniform2fv(
        o_gl.o_uniform_locations.o_uniform_location__o_scl_canvas,
        [o_canvas.width, o_canvas.height]
    );
    o_gl.uniform1f(
        o_gl.o_uniform_locations.o_uniform_location__n_t_ms, 
        window.performance.now()
    )
    // Clear canvas
    o_gl.clearColor(0.0, 0.0, 0.0, 1.0);
    o_gl.clear(o_gl.COLOR_BUFFER_BIT);

    var n_dimensions = 3;
    // Draw
    o_gl.drawArrays(o_gl.TRIANGLES, 0, parseInt(o_gl.a_n_vertex_axisvalue.length/n_dimensions));
}

f_render__recursive(o_gl);
