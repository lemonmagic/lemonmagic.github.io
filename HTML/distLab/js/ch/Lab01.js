"use strict";
var gl;

window.onload = function init() {
	var canvas = document.getElementById("tri_squ-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	// Configure WebGL
	gl.viewport(0, 0, canvas.width, canvas.height);
	//设置背景色清空canvas对象（R,G,B,A）
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Three Vertices
	var vertices = [
		-0.6, 0.3,
		-1.0, -0.5,
		-0.2, -0.5,
		0.0, -0.5,
		0.0, 0.5,
		1.0, 0.5,
		1.0, -0.5,
	];
	var colors = [
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
	]
	// 创建缓冲区对象
	var bufferId = gl.createBuffer();
	// 绑定缓冲区对象
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	// 对缓冲区写入数据
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	// 返回了给定WebGLProgram对象中某属性的下标指向位置
	var vPosition = gl.getAttribLocation(program, "vPosition");
	// 将缓冲区对象分配给一个attribute变量
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	// 开启attribute变量
	gl.enableVertexAttribArray(vPosition);

	// 创建缓冲区对象
	var bufferId2 = gl.createBuffer();
	// 绑定缓冲区对象
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId2);
	// 对缓冲区写入数据
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	// 返回了给定WebGLProgram对象中某属性的下标指向位置
	var vColor = gl.getAttribLocation(program, "vColor");
	// 将缓冲区对象分配给一个attribute变量
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	// 开启attribute变量
	gl.enableVertexAttribArray(vColor);

	render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	gl.drawArrays(gl.TRIANGLE_FAN, 3, 4);
}