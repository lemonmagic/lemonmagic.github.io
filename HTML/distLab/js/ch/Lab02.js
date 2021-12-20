"use strict";
const { vec3 } = glMatrix;
var gl;
var pointsA = [];
var pointsB = [];
var colors = [];
var pointsC = [];
var thetaD = 0.0;
var thetaLocD;
var pointsD = [];
var thetaE = 0.0;
var thetaLocE;
var pointsE = [];
function initTrianglesA(num) {
	var numTimesToSubdivide = num;
	var canvas = document.getElementById("gl-canvas-A");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}
	// initialise data for Sierpinski gasket
	// first, initialise the corners of the gasket with three points.
	var vertices = [
		-1, -1, 0,
		0, 1, 0,
		1, -1, 0
	];
	var u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
	var v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
	var w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
	pointsA = [];
	divideTriangleA(u, v, w, numTimesToSubdivide);
	// configure webgl
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	// load shaders and initialise attribute buffers
	var program = initShaders(gl, "vertex-shader-A", "fragment-shader-A");
	gl.useProgram(program);
	// load data into gpu
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsA), gl.STATIC_DRAW);
	// associate out shader variables with data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	renderA();
}

function initTrianglesB(num) {
  var numTimesToSubdivide = num;
  var canvas = document.getElementById("gl-canvas-B");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }
  // initialise data for 3d sierpinski gasket
  // first initialize the vertices of the 3d gasket
  // four vertices on unit cicle
  // initial tetrahedron with equal length sides
  var vertices = [
    0.0000, 0.0000, -1.0000,
    0.0000, 0.9428, 0.3333,
    -0.8165, -0.4714, 0.3333,
    0.8165, -0.4714, 0.3333
  ];

  // var t = vec3.create();
  // vec3.set(t, vertices[0], vertices[1], vertices[2]);
  var t = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
  // var u = vec3.create();
  // vec3.set(u, vertices[3], vertices[4], vertices[5]);
  var u = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
  // var v = vec3.create();
  // vec3.set(v, vertices[6], vertices[7], vertices[8]);
  var v = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
  // var w = vec3.create();
  // vec3.set(w, vertices[9], vertices[10], vertices[11]);
  var w = vec3.fromValues(vertices[9], vertices[10], vertices[11]);
  divideTetraB(t, u, v, w, numTimesToSubdivide);

  // configure webgl
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  // enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  // load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader-B", "fragment-shader-B");
  gl.useProgram(program);

  // create buffer object, initialize it, and associate it with
  // attribute variables in vertex shader

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsB), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  renderB();
};

function initTrianglesC(num) {
	var numTimesToSubdivide = num;
	var canvas = document.getElementById("gl-canvas-C");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}
	// initialise data for Sierpinski gasket
	// first, initialise the corners of the gasket with three points.
	var vertices = [
		-1, -1, 0,
		0, 1, 0,
		1, -1, 0
	];
	var u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
	var v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
	var w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
	pointsC = [];
	divideTriangleC(u, v, w, numTimesToSubdivide);
	// configure webgl
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	// load shaders and initialise attribute buffers
	var program = initShaders(gl, "vertex-shader-C", "fragment-shader-C");
	gl.useProgram(program);
	// load data into gpu
	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsC), gl.STATIC_DRAW);
	// associate out shader variables with data buffer
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	renderC();
}

function initTrianglesD(theta) {
  thetaD = theta;
  var numTimesToSubdivide = 4;
  var canvas = document.getElementById("gl-canvas-D");
  gl = WebGLUtils.setupWebGL(canvas, "experimental-webgl");
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = initShaders(gl, "rot-v-shader-D", "rot-f-shader-D");
  gl.useProgram(program);

  var vertices = [
    -0.5, -0.5, 0,
		0, 0.5, 0,
		0.5, -0.5, 0
  ];
  var u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
	var v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
	var w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
	divideTriangleD(u, v, w, numTimesToSubdivide);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsD), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLocD = gl.getUniformLocation(program, "theta");

  renderD();
}

function initTrianglesE(theta) {
  thetaE = theta;
  var numTimesToSubdivide = 4;
  var canvas = document.getElementById("gl-canvas-E");
  gl = WebGLUtils.setupWebGL(canvas, "experimental-webgl");
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  var program = initShaders(gl, "rot-v-shader-E", "rot-f-shader-E");
  gl.useProgram(program);

  var vertices = [
    -0.5, -0.5, 0,
		0, 0.5, 0,
		0.5, -0.5, 0
  ];
  var u = vec3.fromValues(vertices[0], vertices[1], vertices[2]);
	var v = vec3.fromValues(vertices[3], vertices[4], vertices[5]);
	var w = vec3.fromValues(vertices[6], vertices[7], vertices[8]);
	divideTriangleE(u, v, w, numTimesToSubdivide);

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointsE), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  thetaLocE = gl.getUniformLocation(program, "theta");

  renderE();
}

function triangleA(a, b, c) {
	pointsA.push(a[0], a[1], a[2]);
	pointsA.push(b[0], b[1], b[2]);
	pointsA.push(c[0], c[1], c[2]);
}

function triangleB(a, b, c, color) {
  // add colors and vertices for one triangle
  var baseColor = [
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0
  ];

  for (var k = 0; k < 4; k++) {
    colors.push(baseColor[color * 4 + k]);
  }
  for (var k = 0; k < 3; k++)
    pointsB.push(a[k]);

  for (var k = 0; k < 4; k++) {
    colors.push(baseColor[color * 4 + k]);
  }
  for (var k = 0; k < 3; k++)
    pointsB.push(b[k]);

  for (var k = 0; k < 4; k++) {
    colors.push(baseColor[color * 4 + k]);
  }
  for (var k = 0; k < 3; k++)
    pointsB.push(c[k]);
}

function tetraB(a, b, c, d) {
  triangleB(a, c, b, 0);
  triangleB(a, c, d, 1);
  triangleB(a, b, d, 2);
  triangleB(b, c, d, 3);
}

function triangleC(a, b, c) {
	pointsC.push(a[0], a[1], a[2]);
	pointsC.push(b[0], b[1], b[2]);
  pointsC.push(b[0], b[1], b[2]);
	pointsC.push(c[0], c[1], c[2]);
  pointsC.push(c[0], c[1], c[2]);
  pointsC.push(a[0], a[1], a[2]);
}

function triangleD(a, b, c) {
	pointsD.push(a[0], a[1], a[2]);
	pointsD.push(b[0], b[1], b[2]);
  pointsD.push(b[0], b[1], b[2]);
	pointsD.push(c[0], c[1], c[2]);
  pointsD.push(c[0], c[1], c[2]);
  pointsD.push(a[0], a[1], a[2]);
}

function triangleE(a, b, c) {
	pointsE.push(a[0], a[1], a[2]);
	pointsE.push(b[0], b[1], b[2]);
  pointsE.push(b[0], b[1], b[2]);
	pointsE.push(c[0], c[1], c[2]);
  pointsE.push(c[0], c[1], c[2]);
  pointsE.push(a[0], a[1], a[2]);
}

function divideTriangleA(a, b, c, count) {
	// check for end of recursion
	if (count == 0) {
		triangleA(a, b, c);
	} else {
		var ab = vec3.create();
		vec3.lerp(ab, a, b, 0.5); // ab=a*alpha+b*(1-alpha)
		var bc = vec3.create();
		vec3.lerp(bc, b, c, 0.5);
		var ca = vec3.create();
		vec3.lerp(ca, c, a, 0.5);
		
		// three new triangles
		divideTriangleA(a, ab, ca, count - 1);
		divideTriangleA(b, bc, ab, count - 1);
		divideTriangleA(c, ca, bc, count - 1);
		// divideTriangle( ab, bc, ca, count-1 );
	}
}

function divideTetraB(a, b, c, d, count) {
  // check for end of recursion
  if (count == 0) {
    tetraB(a, b, c, d);
  } else {
    var ab = vec3.create();
    glMatrix.vec3.lerp(ab, a, b, 0.5);
    var ac = vec3.create();
    glMatrix.vec3.lerp(ac, a, c, 0.5);
    var ad = vec3.create();
    glMatrix.vec3.lerp(ad, a, d, 0.5);
    var bc = vec3.create();
    glMatrix.vec3.lerp(bc, b, c, 0.5);
    var bd = vec3.create();
    glMatrix.vec3.lerp(bd, b, d, 0.5);
    var cd = vec3.create();
    glMatrix.vec3.lerp(cd, c, d, 0.5);

    --count;

    divideTetraB(a, ab, ac, ad, count);
    divideTetraB(ab, b, bc, bd, count);
    divideTetraB(ac, bc, c, cd, count);
    divideTetraB(ad, bd, cd, d, count);
  }

}

function divideTriangleC(a, b, c, count) {
	// check for end of recursion
	if (count == 0) {
		triangleC(a, b, c);
	} else {
		var ab = vec3.create();
		vec3.lerp(ab, a, b, 0.5); // ab=a*alpha+b*(1-alpha)
		var bc = vec3.create();
		vec3.lerp(bc, b, c, 0.5);
		var ca = vec3.create();
		vec3.lerp(ca, c, a, 0.5);
		
		// three new triangles
		divideTriangleC(a, ab, ca, count - 1);
		divideTriangleC(b, bc, ab, count - 1);
		divideTriangleC(c, ca, bc, count - 1);
		divideTriangleC(ab, bc, ca, count-1 );
	}
}

function divideTriangleD(a, b, c, count) {
	// check for end of recursion
	if (count == 0) {
		triangleD(a, b, c);
	} else {
		var ab = vec3.create();
		vec3.lerp(ab, a, b, 0.5); // ab=a*alpha+b*(1-alpha)
		var bc = vec3.create();
		vec3.lerp(bc, b, c, 0.5);
		var ca = vec3.create();
		vec3.lerp(ca, c, a, 0.5);
		
		// three new triangles
		divideTriangleD(a, ab, ca, count - 1);
		divideTriangleD(b, bc, ab, count - 1);
		divideTriangleD(c, ca, bc, count - 1);
		divideTriangleD(ab, bc, ca, count - 1 );
	}
}

function divideTriangleE(a, b, c, count) {
	// check for end of recursion
	if (count == 0) {
		triangleE(a, b, c);
	} else {
		var ab = vec3.create();
		vec3.lerp(ab, a, b, 0.5); // ab=a*alpha+b*(1-alpha)
		var bc = vec3.create();
		vec3.lerp(bc, b, c, 0.5);
		var ca = vec3.create();
		vec3.lerp(ca, c, a, 0.5);
		
		// three new triangles
		divideTriangleE(a, ab, ca, count - 1);
		divideTriangleE(b, bc, ab, count - 1);
		divideTriangleE(c, ca, bc, count - 1);
		divideTriangleE(ab, bc, ca, count - 1);
	}
}

function renderA() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, pointsA.length / 3);
}

function renderB() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, pointsB.length / 3);
}

function renderC() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays( gl.LINES, 0, pointsC.length / 3 );
}

function renderD() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (thetaD > 2 * Math.PI)
    thetaD -= (2 * Math.PI);
  gl.uniform1f(thetaLocD, thetaD);
  gl.drawArrays(gl.LINES, 0, pointsD.length/3);
  // window.requestAnimFrame(renderD);
}

function renderE() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (thetaE > 2 * Math.PI)
    thetaE -= (2 * Math.PI);
  gl.uniform1f(thetaLocE, thetaE);
  gl.drawArrays(gl.LINES, 0, pointsE.length/3);
  // window.requestAnimFrame(renderE);
}