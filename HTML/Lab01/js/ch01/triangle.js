// API查询：https://developer.mozilla.org/zh-CN/docs/Web/API
// https://zhuanlan.zhihu.com/p/148038595
"use strict";

var gl;

window.onload = function init() {
	var canvas = document.getElementById("triangle-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	// Configure WebGL
	gl.viewport(0, 0, canvas.width, canvas.height);
	//设置背景色清空canvas对象（R,G,B,A）
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	//清空颜色缓冲区
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader-tri", "fragment-shader-tri");
	gl.useProgram(program);

	// Three Vertices
	var vertices = [
		0.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0,
	];

	// 创建缓冲区对象
	var bufferId = gl.createBuffer();
	/**
	 * void gl.bindBuffer(target, buffer); 绑定缓冲区对象
	 *	 GLenum target:缓冲对象的类型
	 *	 GLuint buffer:要绑定的缓冲对象的名称
	 */
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
	/**
	 * gl.bufferData(target,data,usage); 创建并初始化Buffer对象的数据存储区
	 *	 target:指定Buffer绑定点
	 *				 gl.ARRAY_BUFFER	包含顶点属性的Buffer,如顶点坐标，纹理坐标数据或顶点颜色数据
	 *				 gl.ELEMENT_ARRAY_BUFFER	用于元素索引的Buffer
	 *	 data:写入缓冲区对象的数据
	 *	 usage:表示程序如何处理写入的数据
	 * 			 	gl.STATIC_DRAM　　只会向缓冲区写入一次数据，但需要绘制很多次
	 * 				gl.STREAM_DARM　　只会向缓冲区对象写入一次数据，然后需要绘制若干次
	 * 				gl.DYNAMIC_DRAM　 会向缓冲区对象中写入多次数据，并绘制很多次
	 */
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

	// Associate external shader variables with data buffer
	/**
	 * GLint gl.getAttribLocation(program, name); 返回了给定WebGLProgram对象中某属性的下标指向位置
	 *	program:一个包含了属性参数的WebGLProgram 对象。
	 *	name:需要获取下标指向位置的 DOMString 属性参数名 
	 */
	var vPosition = gl.getAttribLocation(program, "vPosition");
	/**
	 * void gl.vertexAttribPointer(index, size, type, normalized, stride, offset); 告诉显卡从当前绑定的缓冲区（bindBuffer()指定的缓冲区）中读取顶点数据。
	 *	 index:指定要修改的顶点属性索引
	 *	 size:指定每个顶点属性的组数，必须是1~4
	 *	 type:指定阵列中每个组件的数据类型
	 *	 normalized:指定在将整数数据值投向浮子时是否应正常化为一定范围
	 *	 srtide:指定连续顶点属性开始之间的字节偏移
	 *	 offset:指定顶点属性阵列中第一个组件字节中的偏移
	 */
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	//开启attribute变量
	gl.enableVertexAttribArray(vPosition);
	/**
	 * void gl.drawArrays(mode, first, count); 用于从向量数组中绘制图元
	 *	 mode:指定绘制图元的方式
	 * 				GL_TRIANGLES	是以每三个顶点绘制一个三角形。
	 * 										第一个三角形使用顶点v0,v1,v2，第二个使用v3,v4,v5,以此类推。
	 * 										如果顶点的个数n不是3的倍数，那么最后的1个或者2个顶点会被忽略。
	 * 				GL_TRIANGLE_FAN		绘制各三角形形成一个扇形序列，以v0为起始点
	 * 												（v0，v1，v2）、（v0，v2，v3）、（v0，v3，v4）
	 *	 first:指定从哪个点开始绘制
	 *	 count:指定绘制需要使用到多少个点。
	 */
	gl.drawArrays( gl.TRIANGLES, 0, 3 );
}

function render() {
	
	
	gl.drawArrays( gl.TRIANGLES, 0, 3 );
	// gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	// gl.drawArrays( gl.TRIANGLE_FANS, 3, 6 );
}