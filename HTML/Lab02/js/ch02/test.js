function init(num) {
	var canvas = document.getElementById("gl-canvas-2D");
	var gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	var program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	render();
}

function triangle(a, b, c) {
	points.push(a);
	points.push(b);
	points.push(c);
}

function divideTriangle(a, b, c, count) {
	if (count == 0) {
		triangle(a, b, c);
	} else {
		var ab = vec3.create();
		vec3.lerp(ab, a, b, 0.5); // ab=a*alpha+b*(1-alpha)
		var bc = vec3.create();
		vec3.lerp(bc, b, c, 0.5);
		var ca = vec3.create();
		vec3.lerp(ca, c, a, 0.5);

		--count;

		divideTriangle(a, ab, ac, count);
		divideTriangle(b, bc, bc, count);
		divideTriangle(c, ca, ab, count);
	}
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, points.length / 3);
}