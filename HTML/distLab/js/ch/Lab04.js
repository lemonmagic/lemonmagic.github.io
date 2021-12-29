"use strict";

const {
    vec3, vec4, mat4
} = glMatrix;

var canvas;
var gl;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var dxt = 0.0;
var dyt = 0.0;
var dzt = 0.0;
var dxm = 0.0;
var dym = 0.0;
var dzm = 0.0;
var dxs = 1.0;
var dys = 1.0;
var dzs = 1.0;

var near = -10;
var far = 10;
var radius = 6.0;
var theta = 0.0;
var phi = 0.0;
var stept = 5.0 * Math.PI / 180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;


var eye;
var at = vec3.fromValues(0.0, 0.0, 0.0);
var up = vec3.fromValues(0.0, 1.0, 0.0);

function initCube() {
    canvas = document.getElementById("rtcb-canvas-1");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    makeCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // load shaders and initialize attribute buffer
    var program = initShaders(gl, "rtvshader-1", "rtfshader-1");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    modelViewMatrix = mat4.create();
    projectionMatrix = mat4.create();

    document.getElementById("x+button").onclick = function () {
        dxt += 0.1;
    }
    document.getElementById("y+button").onclick = function () {
        dyt += 0.1;
    }
    document.getElementById("z+button").onclick = function () {
        dzt += 0.1;
    }
    document.getElementById("x-button").onclick = function () {
        dxt -= 0.1;
    }
    document.getElementById("y-button").onclick = function () {
        dyt -= 0.1;
    }
    document.getElementById("z-button").onclick = function () {
        dzt -= 0.1;
    }
    document.getElementById("x+tbutton").onclick = function () {
        dxm += 0.1;
    }
    document.getElementById("y+tbutton").onclick = function () {
        dym += 0.1;
    }
    document.getElementById("z+tbutton").onclick = function () {
        dzm += 0.1;
    }
    document.getElementById("x-tbutton").onclick = function () {
        dxm -= 0.1;
    }
    document.getElementById("y-tbutton").onclick = function () {
        dym -= 0.1;
    }
    document.getElementById("z-tbutton").onclick = function () {
        dzm -= 0.1;
    }
    document.getElementById("x+sbutton").onclick = function () {
        dxs += 0.1;
    }
    document.getElementById("y+sbutton").onclick = function () {
        dys += 0.1;
    }
    document.getElementById("z+sbutton").onclick = function () {
        dzs += 0.1;
    }
    document.getElementById("x-sbutton").onclick = function () {
        dxs -= 0.1;
    }
    document.getElementById("y-sbutton").onclick = function () {
        dys -= 0.1;
    }
    document.getElementById("z-sbutton").onclick = function () {
        dzs -= 0.1;
    }

    render();
}

function makeCube() {
    var vertices = [
        glMatrix.vec4.fromValues(-0.1, -0.1,  0.1, 1.0),
        glMatrix.vec4.fromValues(-0.1,  0.1,  0.1, 1.0),
        glMatrix.vec4.fromValues( 0.1,  0.1,  0.1, 1.0),
        glMatrix.vec4.fromValues( 0.1, -0.1,  0.1, 1.0),
        glMatrix.vec4.fromValues(-0.1, -0.1, -0.1, 1.0),
        glMatrix.vec4.fromValues(-0.1,  0.1, -0.1, 1.0),
        glMatrix.vec4.fromValues( 0.1,  0.1, -0.1, 1.0),
        glMatrix.vec4.fromValues( 0.1, -0.1, -0.1, 1.0),
    ];
    var vertexColors = [
        glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 0.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(0.0, 1.0, 1.0, 1.0),
        glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 1.0)
    ];
    var faces = [
        1, 0, 3, 1, 3, 2, //正
        2, 3, 7, 2, 7, 6, //右
        3, 0, 4, 3, 4, 7, //底
        6, 5, 1, 6, 1, 2, //顶
        4, 5, 6, 4, 6, 7, //背
        5, 4, 0, 5, 0, 1  //左
    ];
    for (var i = 0; i < faces.length; i++) {
        points.push(vertices[faces[i]][0], vertices[faces[i]][1], vertices[faces[i]][2]);

        colors.push(vertexColors[Math.floor(i / 6)][0], vertexColors[Math.floor(i / 6)][1], vertexColors[Math.floor(i / 6)][2], vertexColors[Math.floor(i / 6)][3]);
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3.fromValues(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
    );
    mat4.lookAt(modelViewMatrix, eye, at, up);
    mat4.scale(modelViewMatrix, modelViewMatrix, vec3.fromValues(dxs, dys, dzs))
    mat4.translate(modelViewMatrix, modelViewMatrix, vec3.fromValues(dxm, dym, dzm));
    mat4.rotateX(modelViewMatrix, modelViewMatrix, dxt);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, dyt);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, dzt);
    mat4.ortho(projectionMatrix, left, right, bottom, ytop, near, far);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, new Float32Array(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, new Float32Array(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
    requestAnimFrame(render);
}