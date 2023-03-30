console.log("client run!")

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

var s_source_code_glsl_vertex = `
attribute vec2 a_position;
attribute vec2 a_texCoord;

uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
   // convert the rectangle from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}
`
var s_source_code_glsl_fragment = `
precision mediump float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

void main() {
   gl_FragColor = texture2D(u_image, v_texCoord);
}
`


function main() {
    var image = new Image();
    image.src = "./leaves.jpg";  // MUST BE SAME DOMAIN!!!
    image.onload = function() {
      render(image);
    };
  }
  
  function render(image) {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = o_canvas;
    var gl = o_gl;
    if (!gl) {
      return;
    }
  
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


    var program = o_gl_program;
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");
  
    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();
  
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set a rectangle the same size as the image.
    setRectangle(gl, 0, 0, image.width, image.height);
  
    // provide texture coordinates for the rectangle.
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        0.0,  1.0,
        0.0,  1.0,
        1.0,  0.0,
        1.0,  1.0,
    ]), gl.STATIC_DRAW);
  
    // Create a texture.
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
  
    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
  
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation, size, type, normalize, stride, offset);
  
    // Turn on the texcoord attribute
    gl.enableVertexAttribArray(texcoordLocation);
  
    // bind the texcoord buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  
    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        texcoordLocation, size, type, normalize, stride, offset);
  
    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
  
    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }
  
  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
       x1, y1,
       x2, y1,
       x1, y2,
       x1, y2,
       x2, y1,
       x2, y2,
    ]), gl.STATIC_DRAW);
  }
  
  main();

// var o_shader_compiled__vertex = f_o_shader_compiled(o_gl, s_source_code_glsl_vertex, o_gl.VERTEX_SHADER);
// var o_shader_compiled__fragment = f_o_shader_compiled(o_gl, s_source_code_glsl_fragment, o_gl.FRAGMENT_SHADER);

// // Create program
// var o_gl_program = o_gl.createProgram();

// // Attach and link shaders to the program
// o_gl.attachShader(o_gl_program, o_shader_compiled__vertex);
// o_gl.attachShader(o_gl_program, o_shader_compiled__fragment);
// o_gl.linkProgram(o_gl_program);
// if (!o_gl.getProgramParameter(o_gl_program, o_gl.LINK_STATUS)) {
//     alert("Unable to initialize the shader program");
//     // return false;
// }

// // Use program
// o_gl.useProgram(o_gl_program);
// o_gl.program = o_gl_program;

// // Vertices
// var n_dimensions = 3;
// var a_n_vertex_axisvalue = new Float32Array([// [ x, y, z, x, y, z, ...]
//     //x    y     z 
//     +0.0, +0.5, +0.0,
//     -0.5, -0.5, +0.0,
//     +0.5, -0.5, +0.0
// ]);

// // Create a buffer object
// var o_buffer__vertex = o_gl.createBuffer();
// if (!o_buffer__vertex) {
//     console.log('Failed to create the buffer object');
//     // return -1;
// }
// o_gl.bindBuffer(o_gl.ARRAY_BUFFER, o_buffer__vertex);
// o_gl.bufferData(o_gl.ARRAY_BUFFER, a_n_vertex_axisvalue, o_gl.STATIC_DRAW);

// // Assign the a_n_vertex_axisvalue in buffer object to o_position variable
// var o_attrloc__o_position = o_gl.getAttribLocation(o_gl.program, 'o_position');
// if (o_attrloc__o_position < 0) {
//     console.log('Failed to get the storage location of o_position');
//     // return -1;
// }
// o_gl.vertexAttribPointer(o_attrloc__o_position, n_dimensions, o_gl.FLOAT, false, 0, 0);
// o_gl.enableVertexAttribArray(o_attrloc__o_position);

// // Return number of a_n_vertex_axisvalue
// var n = a_n_vertex_axisvalue.length / n_dimensions;

// if (n < 0) {
//     console.log('Failed to set the positions of the vertices');
//     // return;
// }




// // add uniform at init time
// var o_uniform_location__o_trn_mouse = o_gl.getUniformLocation(o_gl.program, "o_trn_mouse");

// var a_n_axisval__mouse = [0,0];
// o_canvas.onmousemove = function(){
//     a_n_axisval__mouse[0] = window.event.clientX;
//     a_n_axisval__mouse[1] = window.event.clientY;
// }


// let f_render__recursive = function(o_gl){
//     requestAnimationFrame(function(){
//         f_render__recursive(o_gl)
//     });
//     console.log(a_n_axisval__mouse)
//     o_gl.uniform1fv(
//         o_uniform_location__o_trn_mouse,
//         a_n_axisval__mouse
//     );
//     // Clear canvas
//     o_gl.clearColor(1.0, 0.0, 0.0, 1.0);
//     o_gl.clear(o_gl.COLOR_BUFFER_BIT);

//     // Draw
//     o_gl.drawArrays(o_gl.TRIANGLES, 0, 6);
// }

// f_render__recursive(o_gl);
