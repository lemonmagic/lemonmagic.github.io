"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;
var direction = 1;
var delay = 200;
var num = 4;
var time;

function changeTri(){
	num = 3;
	clearTimeout(time);
	renderA();
}

function changeSqu(){
	num = 4;
	clearTimeout(time);
	renderA();
}

function changeDir(){
	clearTimeout(time);
	direction *= -1;
	renderA();
}

function fast(){
	clearTimeout(time);
	delay /= 2;
}

function slow(){
	clearTimeout(time);
	delay *= 2;
}

function speed(num){
	clearTimeout(time);
	delay = num;
}

function initRotSquare(){
	canvas = document.getElementById( "rot-canvas-A" );
	gl = WebGLUtils.setupWebGL( canvas, "experimental-webgl" );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	var program = initShaders( gl, "rot-v-shader-A", "rot-f-shader-A" );
	gl.useProgram( program );

	var vertices = [
		 0,  1,  0,
		-1,  0,  0,
		 1,  0,  0,
		 0, -1,  0
	];

	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );

	thetaLoc = gl.getUniformLocation( program, "theta" );

	renderA();
}

function renderA(){

	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set uniform values
	theta += direction * 0.1;
	if( theta > 2 * Math.PI )
		theta -= (2 * Math.PI);
	else if( theta < -2 * Math.PI )
		theta += ( 2 * Math.PI );

	gl.uniform1f( thetaLoc, theta );

	gl.drawArrays( gl.TRIANGLE_STRIP, 0, num );

	// update and render
	time = setTimeout( function (){ requestAnimFrame( renderA ); }, delay );
	console.log(delay);
}