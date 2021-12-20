// 全局变量
var gl;				// WebGL上下文
var ctx;			// 2D绘图上下文
var program; 		// shader program
// var canvas;
var hud;
var CubeTex; // texobj
var Score = 0;	// 消掉小球后的分数
var Restart = false;	// 重开
var sizeGround = 30;	// 球的随机位置变量
var matMV;			// 模视投影矩阵
var mvStack = [];  // 模视投影矩阵栈，用数组实现，初始为空
var matCamera = mat4();	 // 照相机变换，初始为恒等矩阵
var matReverse = mat4(); // 照相机变换的逆变换，初始为恒等矩阵
var matCameraY = mat4(); // 相机变换y轴变换单独矩阵，初始为恒等矩阵
var ctrl = false;
var downSize = 0;	// like jumpY
var space = false;
var upSize = 0;
var LIGHTS = true;
var matProj;  // 透视投影矩阵
var matOrthoPorj;	// 	正交投影矩阵
var yRot = 0.0;        // 用于动画的旋转角
var zRot = 0.0;
var deltaAngle = 60.0; // 每秒旋转角度
var Xmove = 0, Ymove = 0;
var LevelY = 0;
// 用于保存W、S、A、D四个方向键的按键状态的数组
var keyDown = [false, false, false, false];
var g = 9.8;				// 重力加速度
var initSpeed = 4; 			// 初始速度 
var jumping = false;	    // 是否处于跳跃过程中
var jumpY = 0;          	// 当前跳跃的高度
var jumpTime = 0;			// 从跳跃开始经历的时间
var FBOforSelect;	// 用于拾取的FBO
// 光源对象，构造函数，各项属性有默认值
var Light = function () {
	this.pos = vec4(0.0, 2.0, 0.0, 0.0);	// 光源位置
	this.ambient = vec3(0.2, 0.2, 0.2);		// 环境光		
	this.diffuse = vec3(1.0, 1.0, 1.0);		// 漫反射光
	this.specular = vec3(1.0, 1.0, 1.0);	// 镜面反射光
	this.switch = true;	// 光源开关
}
var lights = [];	// 光源数组
var lightSun = new Light();	// 默认光源属性
var lightRed = new Light();	// 红色位置光源（太阳光）
var lightYellow = new Light(); // 黄色手电筒光源
var textureLoaded = 0;	// 已加载完毕的纹理图数量
var numTextures = 5;	// 需要加载的纹理图总数
var RedLightTexObj; // 红色光源球所使用的单独纹理对象
var skyTexObj;		// 天空球使用的纹理对象
var skyTexObj2;
var DoN = true;			// 判定天空球选用的纹理对象
var obj = loadOBJ("Res/Saber.obj");		// 开始读取obj模型（异步），返回OBJMODEL对象
var programObj;							// obj模型绘制所使用的program
var attribIndex = new AttribIndex();	// programObj中attribute变量索引
var mtlIndex = new MTLIndex();			// programObj中材质变量索引
// 材质对象（构造函数，各属性有默认值）
var MaterialObj = function () {
	this.ambient = vec3(0.0, 0.0, 0.0);	// 环境反射系数
	this.diffuse = vec3(0.8, 0.8, 0.8);	// 漫反射系数
	this.specular = vec3(0.0, 0.0, 0.0);// 镜面反射系数
	this.emission = vec3(0.0, 0.0, 0.0);// 发射光
	this.shininess = 10;				// 高光系数
	this.alpha = 1.0;					// 透明度，默认不透明
}
var mtlRedLight = new MaterialObj();	// 红光源球使用的材质对象(要放在Material对象的声明之后)
// 设置红光源球的材质属性
mtlRedLight.ambient = vec3(0.1, 0.1, 0.1);
mtlRedLight.diffuse = vec3(0.2, 0.2, 0.2);
mtlRedLight.specular = vec3(0.2, 0.2, 0.2);
mtlRedLight.emission = vec3(1.0, 0.1, 0.1);
mtlRedLight.shininess = 150;
var mtlRedLightOff = new MaterialObj();	// 红光源关闭时球使用的材质对象(要放在Material对象的声明之后)
// 设置红光源球的材质属性(关闭)
mtlRedLightOff.ambient = vec3(0.1, 0.1, 0.1);
mtlRedLightOff.diffuse = vec3(0.8, 0.8, 0.8);
mtlRedLightOff.specular = vec3(0.2, 0.2, 0.2);
mtlRedLightOff.emission = vec3(0.1, 0.1, 0.1);
mtlRedLightOff.shininess = 150;
mtlRedLightOff.alpha = 0.5;
var TextureObj = function (pathName, format, mipmapping) {
	this.path = pathName;	// 纹理图文件路径
	this.format = format;	// 数据格式
	this.mipmapping = mipmapping;	// 是否启用mipmapping
	this.texture = null;	// Webgl纹理对象
	this.complete = false;	// 是否已完成文件加载
}
// 定义Obj对象
// 构造函数
var Obj = function () {
	this.numVertices = 0; 			// 顶点个数
	this.vertices = new Array(0); 	// 用于保存顶点数据的数组
	this.normals = new Array(0);  	// 用于保存法向数据的数组
	this.texcoords = new Array(0);	// 用于保存纹理坐标数据的数组
	this.vertexBuffer = null;		// 存放顶点数据的buffer对象
	this.normalBuffer = null;		// 存放法向数据的buffer对象
	this.texBuffer = null;			// 存放纹理坐标数据的buffer对象
	this.material = new MaterialObj(); // 材质
	this.texObj = null;				// Texture对象
}

// 初始化缓冲区对象(VBO)
Obj.prototype.initBuffers = function () {
	/*创建并初始化顶点坐标缓冲区对象(Buffer Object)*/
	// 创建缓冲区对象，存于成员变量vertexBuffer中
	this.vertexBuffer = gl.createBuffer();
	// 将vertexBuffer绑定为当前Array Buffer对象
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	// 为Buffer对象在GPU端申请空间，并提供数据
	gl.bufferData(gl.ARRAY_BUFFER,	// Buffer类型
		flatten(this.vertices),		// 数据来源
		gl.STATIC_DRAW	// 表明是一次提供数据，多遍绘制
	);
	// 顶点数据已传至GPU端，可释放内存
	this.vertices.length = 0;
	/*创建并初始化顶点法向坐标缓冲区对象(Buffer Object)*/
	if (this.normals.length != 0) {
		// 创建缓冲区对象，存于成员变量normalBuffer之中
		this.normalBuffer = gl.createBuffer();
		// 将normalBuffer绑定为当前ARRAY_BUFFER对象
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		// 为Buffer对象在GPU端申请空间并提供数据
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);
		// 顶点数据已传到GPU，可释放内存
		this.normals.length = 0;
	}
	/*创建并初始化顶点纹理坐标缓冲区对象(Buffer Object)*/
	if (this.texcoords.length != 0) {
		// 创建缓冲区对象，存于成员变量texBuffer之中
		this.texBuffer = gl.createBuffer();
		// 将texBuffer绑定为当前ARRAY_BUFFER对象
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		// 为Buffer对象在GPU端申请空间并提供数据
		gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texcoords), gl.STATIC_DRAW);
		// 顶点数据已传到GPU，可释放内存
		this.texcoords.length = 0;
	}
}

// 绘制几何对象
// 参数为模视矩阵
Obj.prototype.draw = function (matMV, material, tmpTexObj) {
	// 设置为a_Position提供数据的方式
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	// 为顶点属性数组提供数据(数据存放在vertexBuffer对象中)
	gl.vertexAttribPointer(
		program.a_Position,	// 属性变量索引
		3,					// 每个顶点属性的分量个数
		gl.FLOAT,			// 数组数据类型
		false,				// 是否进行归一化处理
		0,   // 在数组中相邻属性成员起始位置间的间隔(以字节为单位)
		0    // 第一个属性值在buffer中的偏移量
	);
	// 为a_Position启用顶点数组
	gl.enableVertexAttribArray(program.a_Position);
	// 设置为a_Normal提供数据的方式
	if (this.normalBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		// 为顶点属性数组提供数据（数据存放在normalBuffer对象中）
		gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
		// 为a_Normal启用顶点数组
		gl.enableVertexAttribArray(program.a_Normal);
	}
	// 设置为a_Texcoords提供数据的方式
	if (this.texBuffer != null) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		// 为顶点属性数组提供数据（数据存放在texBuffer对象中）
		gl.vertexAttribPointer(program.a_Texcoord, 2, gl.FLOAT, false, 0, 0);
		// 为a_Texcoord启用顶点数组
		gl.enableVertexAttribArray(program.a_Texcoord);
	}
	var mtl;
	if (arguments.length > 1 && arguments[1] != null) {	// 提供了材质(arguments.length代表了函数传参的个数)
		mtl = material;		// 使用传进来的材质参数material
	}
	else {
		mtl = this.material;	// 使用自身的材质this.material
	}
	// 设置材质属性
	var ambientProducts = [];
	var diffuseProducts = [];
	var specularProducts = [];
	for (var i = 0; i < lights.length; i++) {
		ambientProducts.push(mult(lights[i].ambient, mtl.ambient));
		diffuseProducts.push(mult(lights[i].diffuse, mtl.diffuse));
		specularProducts.push(mult(lights[i].specular, mtl.specular));
	}
	gl.uniform3fv(program.u_AmbientProduct, flatten(ambientProducts));
	gl.uniform3fv(program.u_DiffuseProduct, flatten(diffuseProducts));
	gl.uniform3fv(program.u_SpecularProduct, flatten(specularProducts));
	gl.uniform3fv(program.u_Emission, flatten(mtl.emission));
	gl.uniform1f(program.u_Shininess, mtl.shininess);
	gl.uniform1f(program.u_Alpha, mtl.alpha);
	// 参数有提供纹理对象时则用参数提供的，否则用对象自身纹理对象
	var texObj;
	if (arguments.length > 2 && arguments[2] != null) { texObj = tmpTexObj; }	// 提供了纹理对象
	else { texObj = this.texObj }
	// 纹理对象不为空则绑定纹理对象
	if (texObj != null && texObj.complete) {
		gl.bindTexture(gl.TEXTURE_2D, texObj.texture);
	}
	// 开始绘制
	gl.uniformMatrix4fv(program.u_ModelView, false,
		flatten(matMV)); // 传MV矩阵
	gl.uniformMatrix3fv(program.u_NormalMat, false,
		flatten(normalMatrix(matMV)));
	gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
}

// 初始化用于拾取得FBO
// 用于拾取得帧缓存由一个颜色缓存和一个深度缓存构成
function initFrameBufferForSelect() {
	FBOforSelect = gl.createFramebuffer();
	var colorBuffer = gl.createRenderbuffer();
	var depthBuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, colorBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, canvas.width, canvas.height);
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOforSelect);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, colorBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function getSelectedObj(x, y) {
	var pixels = new Uint8Array(4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOforSelect);
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if (status == gl.FRAMEBUFFER_COMPLETE) {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		matMV = mult(matCameraY, matCamera);	//  实现相机
		matMV = mult(translate(0, -jumpY, 0), matMV);
		gl.uniform1i(program.u_DrawSelectedIF, 1);
		for (var i = 0; i < numSpheres; i++) {
			gl.uniform4f(program.u_Color, i * 3 / 255.0, 0.0, 0.0, 1.0);
			if (drawSphereON[i]) {
				mvStack.push(matMV);
				matMV = mult(matMV, translate(posSphereFS[i][0],
					posSphereFS[i][1], posSphereFS[i][2])); // 平移到相应位置
				matMV = mult(matMV, rotateX(90)); // 调整南北极
				sphereFS.draw(matMV, null, null);
				matMV = mvStack.pop();
			}
		}
		gl.uniform1i(program.u_DrawSelectedIF, 0);
		gl.finish();
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		//console.log(pixels);
		//console.log(x, y);
	}
	else {
		return -2;
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	if (pixels[2] > 0) {
		return -1;
	}
	else {
		var i = pixels[0] / 3;
		//console.log(i);
		return i;
	}
}

// 创建纹理对象，加载纹理图
// 参数为文件路径，纹理图格式（gl.RGB、gl.RGBA等）
// 以及是否启用mipmapping
// 返回Texture对象
function loadTexture(path, format, mipmapping) {
	var texObj = new TextureObj(path, format, mipmapping);
	var image = new Image();
	if (!image) {
		console.log("创建image对象失败！");
		return false;
	}
	// 注册图像文件加载完毕事件的响应函数
	image.onload = function () {
		console.log("纹理图：" + path + "加载完毕。");
		// 初始化纹理对象
		initTexture(texObj, image);
		textureLoaded++;	// 增加已加载纹理数
		// 已加载纹理数如果等于总纹理数则可以开始绘制
		if (textureLoaded == numTextures) {
			requestAnimFrame(render);	// 请求重绘
		}
	};
	// 指定图像源，此时浏览器开始加载图像
	image.src = path;
	console.log("开始加载纹理图：" + path);
	return texObj;
}

// 初始化纹理对象
function initTexture(texObj, image) {
	texObj.texture = gl.createTexture();	// 创建纹理对象
	if (!texObj.texture) {
		console.log("创建纹理对象失败！");
		return false;
	}
	// 绑定纹理对象
	gl.bindTexture(gl.TEXTURE_2D, texObj.texture);
	// 在加载纹理图时对其沿着y轴翻转
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	// 加载纹理图像
	gl.texImage2D(gl.TEXTURE_2D, 0, texObj.format, texObj.format, gl.UNSIGNED_BYTE, image);
	if (texObj.mipmapping) {	// 是否开启mipmapping
		// 自动生成各级分辨率的纹理图
		gl.generateMipmap(gl.TEXTURE_2D);
		// 设置插值方式
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	}
	else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	texObj.complete = true;	// 纹理对象初始化完毕
}

function initLights() {
	lights.push(lightSun);
	// 设置光源属性
	lightRed.ambient = vec3(0.3, 0.0, 0.0);		// 环境光
	lightRed.diffuse = vec3(0.0, 0.0, 1.0);		// 漫反射光
	lightRed.specular = vec3(0.0, 0.0, 1.0);	// 镜面反射光
	lights.push(lightRed);
	// 设置手电筒光源
	lightYellow.pos = vec4(0.0, 0.0, 0.0, 1.0);	// 光源位置（观察坐标系)
	lightYellow.ambient = vec3(0.1, 0.1, 0.1);	// 环境光(照射面积小，可以不赋予环境光)
	lightYellow.diffuse = vec3(0.0, 0.0, 0.0);	// 漫反射光
	lightYellow.specular = vec3(0.0, 0.0, 0.0);	// 镜面反射光
	lights.push(lightYellow);
	/* 为progrObj中光源属性传值 */
	gl.useProgram(programObj);
	var ambientLight = [];
	ambientLight.push(lightSun.ambient);
	ambientLight.push(lightRed.ambient);
	ambientLight.push(lightYellow.ambient);
	gl.uniform3fv(programObj.u_AmbientLight, flatten(ambientLight));
	var diffuseLight = [];
	diffuseLight.push(lightSun.diffuse);
	diffuseLight.push(lightRed.diffuse);
	diffuseLight.push(lightYellow.diffuse);
	gl.uniform3fv(programObj.u_DiffuseLight, flatten(diffuseLight));
	var specularLight = [];
	specularLight.push(lightSun.specular);
	specularLight.push(lightRed.specular);
	specularLight.push(lightYellow.specular);
	gl.uniform3fv(programObj.u_SpecularLight, flatten(specularLight));
	// 给聚光灯参数传值（手电筒）(在此设置的原因是整个过程数值都不变)
	gl.uniform3fv(programObj.u_SpotDirection, flatten(vec3(0.0, 0.0, -1.0)));	// 往负Z轴照
	gl.uniform1f(programObj.u_SpotCutOff, 8);	// 设截止角
	gl.uniform1f(programObj.u_SpotExponent, 3);	// 衰减指数
	/* 为program中的光源属性传值 */
	// 启用旧的program
	gl.useProgram(program);
	// 给聚光灯参数传值（手电筒）(在此设置的原因是整个过程数值都不变)
	gl.uniform3fv(program.u_SpotDirection, flatten(vec3(0.0, 0.0, -1.0)));	// 往负Z轴照
	gl.uniform1f(program.u_SpotCutOff, 8);	// 设截止角
	gl.uniform1f(program.u_SpotExponent, 3);	// 衰减指数
	passLightSwitch();	// 光源开关的传值
}

function passLightSwitch() {
	var lightSwitch = [];
	for (var i = 0; i < lights.length; i++) {
		if (lights[i].switch) { lightSwitch[i] = 1; }
		else { lightSwitch[i] = 0; }
	}
	gl.useProgram(program);
	gl.uniform1iv(program.u_LightSwitch, lightSwitch);
	gl.useProgram(programObj);
	gl.uniform1iv(programObj.u_LightSwitch, lightSwitch);
}

function buildFace(fExtent, fStep) {
	var obj = new Obj();
	var iterations = 2 * fExtent / fStep;
	var fTexcoordStep = 40 / iterations;

	for (var x = -fExtent, s = 0; x < fExtent; x += fStep, s += fTexcoordStep) {
		for (var y = fExtent, t = 0; y > -fExtent; y -= fStep, t += fTexcoordStep) {
			// 以(x, 0, z)为左下角的单元四边形的4个顶点
			var ptLowerLeft = vec3(x, y, 0);
			var ptLowerRight = vec3(x + fStep, y, 0);
			var ptUpperLeft = vec3(x, y - fStep, 0);
			var ptUpperRight = vec3(x + fStep, y - fStep, 0);
			// 分成2个三角形
			obj.vertices.push(ptUpperLeft);
			obj.vertices.push(ptLowerLeft);
			obj.vertices.push(ptLowerRight);
			obj.vertices.push(ptUpperLeft);
			obj.vertices.push(ptLowerRight);
			obj.vertices.push(ptUpperRight);
			// 顶点法向
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.numVertices += 6;
		}
	}

	// 纹理坐标
	obj.texcoords.push(vec2(1.0, 0.0));
	obj.texcoords.push(vec2(0.0, 1.0));
	obj.texcoords.push(vec2(1.0, 1.0));
	obj.texcoords.push(vec2(1.0, 1.0));
	obj.texcoords.push(vec2(1.0 + 0.0));
	obj.texcoords.push(vec2(0.0, 0.0));

	obj.material.ambient = vec3(0.1, 0.1, 0.1);
	obj.material.diffuse = vec3(0.5, 0.5, 1.0);
	obj.material.specular = vec3(0.3, 0.3, 0.3);
	obj.material.emission = vec3(0.5, 0.5, 0.5);
	obj.material.shininess = 20;

	return obj;
}
// 在y=0平面绘制中心在原点的格状方形地面
// fExtent：决定地面区域大小(方形地面边长的一半)
// fStep：决定线之间的间隔
// 返回地面Obj对象
function buildGround(fExtent, fStep) {
	var obj = new Obj(); // 新建一个Obj对象
	var iterations = 2 * fExtent / fStep;	// 单层循环次数
	var fTexcoordStep = 40 / iterations;		// 纹理坐标递增步长
	for (var x = -fExtent, s = 0; x < fExtent; x += fStep, s += fTexcoordStep) {
		for (var z = fExtent, t = 0; z > -fExtent; z -= fStep, t += fTexcoordStep) {
			// 以(x, 0, z)为左下角的单元四边形的4个顶点
			var ptLowerLeft = vec3(x, 0, z);
			var ptLowerRight = vec3(x + fStep, 0, z);
			var ptUpperLeft = vec3(x, 0, z - fStep);
			var ptUpperRight = vec3(x + fStep, 0, z - fStep);
			// 分成2个三角形
			obj.vertices.push(ptUpperLeft);
			obj.vertices.push(ptLowerLeft);
			obj.vertices.push(ptLowerRight);
			obj.vertices.push(ptUpperLeft);
			obj.vertices.push(ptLowerRight);
			obj.vertices.push(ptUpperRight);
			// 顶点法向
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			obj.normals.push(vec3(0, 1, 0));
			// 纹理坐标
			obj.texcoords.push(vec2(s, t + fTexcoordStep));
			obj.texcoords.push(vec2(s, t));
			obj.texcoords.push(vec2(s + fTexcoordStep, t));
			obj.texcoords.push(vec2(s, t + fTexcoordStep));
			obj.texcoords.push(vec2(s + fTexcoordStep, t));
			obj.texcoords.push(vec2(s + fTexcoordStep, t + fTexcoordStep));
			obj.numVertices += 6;
		}
	}

	obj.material.ambient = vec3(0.1, 0.1, 0.1);
	obj.material.diffuse = vec3(0.5, 0.5, 1.0);
	obj.material.specular = vec3(0.3, 0.3, 0.3);
	obj.material.emission = vec3(0.0, 0.0, 0.0);
	obj.material.shininess = 10;

	return obj;
}

// 用于生成一个中心在原点的球的顶点数据(南北极在z轴方向)
// 返回球Obj对象，参数为球的半径及经线和纬线数
function buildSphere(radius, columns, rows) {
	var obj = new Obj(); // 新建一个Obj对象
	var vertices = []; // 存放不同顶点的数组

	for (var r = 0; r <= rows; r++) {
		var v = r / rows;  // v在[0,1]区间
		var theta1 = v * Math.PI; // theta1在[0,PI]区间

		var temp = vec3(0, 0, 1);
		var n = vec3(temp); // 实现Float32Array深拷贝
		var cosTheta1 = Math.cos(theta1);
		var sinTheta1 = Math.sin(theta1);
		n[0] = temp[0] * cosTheta1 + temp[2] * sinTheta1;
		n[2] = -temp[0] * sinTheta1 + temp[2] * cosTheta1;

		for (var c = 0; c <= columns; c++) {
			var u = c / columns; // u在[0,1]区间
			var theta2 = u * Math.PI * 2; // theta2在[0,2PI]区间
			var pos = vec3(n);
			temp = vec3(n);
			var cosTheta2 = Math.cos(theta2);
			var sinTheta2 = Math.sin(theta2);

			pos[0] = temp[0] * cosTheta2 - temp[1] * sinTheta2;
			pos[1] = temp[0] * sinTheta2 + temp[1] * cosTheta2;

			var posFull = mult(pos, radius);

			vertices.push(posFull);
		}
	}

	/*生成最终顶点数组数据(使用三角形进行绘制)*/
	var colLength = columns + 1;
	for (var r = 0; r < rows; r++) {
		var offset = r * colLength;

		for (var c = 0; c < columns; c++) {
			var ul = offset + c;						// 左上
			var ur = offset + c + 1;					// 右上
			var br = offset + (c + 1 + colLength);	// 右下
			var bl = offset + (c + 0 + colLength);	// 左下
			// 由两条经线和纬线围成的矩形
			// 分2个三角形来画
			obj.vertices.push(vertices[ul]);
			obj.vertices.push(vertices[bl]);
			obj.vertices.push(vertices[br]);
			obj.vertices.push(vertices[ul]);
			obj.vertices.push(vertices[br]);
			obj.vertices.push(vertices[ur]);
			// 球的法向与顶点坐标相同
			obj.normals.push(vertices[ul]);
			obj.normals.push(vertices[bl]);
			obj.normals.push(vertices[br]);
			obj.normals.push(vertices[ul]);
			obj.normals.push(vertices[br]);
			obj.normals.push(vertices[ur]);
			// 纹理坐标
			obj.texcoords.push(vec2(c / columns, r / rows));
			obj.texcoords.push(vec2(c / columns, (r + 1) / rows));
			obj.texcoords.push(vec2((c + 1) / columns, (r + 1) / rows));
			obj.texcoords.push(vec2(c / columns, r / rows));
			obj.texcoords.push(vec2((c + 1) / columns, (r + 1) / rows));
			obj.texcoords.push(vec2((c + 1) / columns, r / rows));
		}
	}

	vertices.length = 0; //释放 
	obj.numVertices = rows * columns * 6; // 顶点数

	obj.material.ambient = vec3(0.2, 0.2, 0.2);
	obj.material.diffuse = vec3(0.4, 0.0, 0.4);
	obj.material.specular = vec3(0.5, 0.5, 0.5);
	obj.material.emission = vec3(0.0, 0.0, 0.0);
	obj.material.shininess = 100;

	return obj;
}

function buildSphereForSelect(radius, columns, rows) {
	var obj = new Obj(); // 新建一个Obj对象
	var vertices = []; // 存放不同顶点的数组

	for (var r = 0; r <= rows; r++) {
		var v = r / rows;  // v在[0,1]区间
		var theta1 = v * Math.PI; // theta1在[0,PI]区间
		var temp = vec3(0, 0, 1);
		var n = vec3(temp); // 实现Float32Array深拷贝
		var cosTheta1 = Math.cos(theta1);
		var sinTheta1 = Math.sin(theta1);
		n[0] = temp[0] * cosTheta1 + temp[2] * sinTheta1;
		n[2] = -temp[0] * sinTheta1 + temp[2] * cosTheta1;

		for (var c = 0; c <= columns; c++) {
			var u = c / columns; // u在[0,1]区间
			var theta2 = u * Math.PI * 2; // theta2在[0,2PI]区间
			var pos = vec3(n);
			temp = vec3(n);
			var cosTheta2 = Math.cos(theta2);
			var sinTheta2 = Math.sin(theta2);
			pos[0] = temp[0] * cosTheta2 - temp[1] * sinTheta2;
			pos[1] = temp[0] * sinTheta2 + temp[1] * cosTheta2;
			var posFull = mult(pos, radius);
			vertices.push(posFull);
		}
	}

	/*生成最终顶点数组数据(使用三角形进行绘制)*/
	var colLength = columns + 1;
	for (var r = 0; r < rows; r++) {
		var offset = r * colLength;

		for (var c = 0; c < columns; c++) {
			var ul = offset + c;						// 左上
			var ur = offset + c + 1;					// 右上
			var br = offset + (c + 1 + colLength);	// 右下
			var bl = offset + (c + 0 + colLength);	// 左下

			// 由两条经线和纬线围成的矩形
			// 分2个三角形来画
			obj.vertices.push(vertices[ul]);
			obj.vertices.push(vertices[bl]);
			obj.vertices.push(vertices[br]);
			obj.vertices.push(vertices[ul]);
			obj.vertices.push(vertices[br]);
			obj.vertices.push(vertices[ur]);

			// 球的法向与顶点坐标相同
			obj.normals.push(vertices[ul]);
			obj.normals.push(vertices[bl]);
			obj.normals.push(vertices[br]);
			obj.normals.push(vertices[ul]);
			obj.normals.push(vertices[br]);
			obj.normals.push(vertices[ur]);

			// 纹理坐标
			/*obj.texcoords.push(vec2(c / columns, r / rows));
			obj.texcoords.push(vec2(c / columns, (r+1) / rows));
			obj.texcoords.push(vec2((c+1) / columns, (r+1) / rows));
			obj.texcoords.push(vec2(c / columns, r / rows));
			obj.texcoords.push(vec2((c+1) / columns, (r+1) / rows));
			obj.texcoords.push(vec2((c+1) / columns, r / rows));*/
		}
	}
	vertices.length = 0; // 已用不到，释放 
	obj.numVertices = rows * columns * 6; // 顶点数
	obj.material.ambient = vec3(0.0, 0.0, 0.0);
	obj.material.diffuse = vec3(1.0, 0.0, 0.0);
	obj.material.specular = vec3(0.0, 0.0, 0.0);
	obj.material.emission = vec3(0.0, 0.0, 0.0);
	obj.material.shininess = 1;

	return obj;
}

// 构建中心在原点的圆环(由线段构建)
// 参数分别为圆环的主半径(决定环的大小)，
// 圆环截面圆的半径(决定环的粗细)，
// numMajor和numMinor决定模型精细程度
// 返回圆环Obj对象
function buildTorus(majorRadius, minorRadius, numMajor, numMinor) {
	var obj = new Obj(); // 新建一个Obj对象
	obj.numVertices = numMajor * numMinor * 6; // 顶点数
	var majorStep = 2.0 * Math.PI / numMajor;
	var minorStep = 2.0 * Math.PI / numMinor;
	var sScale = 4, tScale = 2;	// 两方方向上纹理坐标的缩放系数
	for (var i = 0; i < numMajor; ++i) {
		var a0 = i * majorStep;
		var a1 = a0 + majorStep;
		var x0 = Math.cos(a0);
		var y0 = Math.sin(a0);
		var x1 = Math.cos(a1);
		var y1 = Math.sin(a1);
		// 三角形条带左右顶点
		var center0 = mult(majorRadius, vec3(x0, y0, 0));
		var center1 = mult(majorRadius, vec3(x1, y1, 0));
		for (var j = 0; j < numMinor; ++j) {
			var b0 = j * minorStep;
			var b1 = b0 + minorStep;
			var c0 = Math.cos(b0);
			var r0 = minorRadius * c0 + majorRadius;
			var z0 = minorRadius * Math.sin(b0);
			var c1 = Math.cos(b1);
			var r1 = minorRadius * c1 + majorRadius;
			var z1 = minorRadius * Math.sin(b1);
			var left0 = vec3(x0 * r0, y0 * r0, z0);
			var right0 = vec3(x1 * r0, y1 * r0, z0);
			var left1 = vec3(x0 * r1, y0 * r1, z1);
			var right1 = vec3(x1 * r1, y1 * r1, z1);
			obj.vertices.push(left0);
			obj.vertices.push(right0);
			obj.vertices.push(left1);
			obj.vertices.push(left1);
			obj.vertices.push(right0);
			obj.vertices.push(right1);
			// 法向从圆环中心指向顶点
			obj.normals.push(subtract(left0, center0));
			obj.normals.push(subtract(right0, center1));
			obj.normals.push(subtract(left1, center0));
			obj.normals.push(subtract(left1, center0));
			obj.normals.push(subtract(right0, center1));
			obj.normals.push(subtract(right1, center1));
			// 纹理坐标
			obj.texcoords.push(vec2(i / numMajor * sScale, j / numMinor * tScale));
			obj.texcoords.push(vec2((i + 1) / numMajor * sScale, j / numMinor * tScale));
			obj.texcoords.push(vec2(i / numMajor * sScale, (j + 1) / numMinor * tScale));
			obj.texcoords.push(vec2(i / numMajor * sScale, (j + 1) / numMinor * tScale));
			obj.texcoords.push(vec2((i + 1) / numMajor * sScale, j / numMinor * tScale));
			obj.texcoords.push(vec2((i + 1) / numMajor * sScale, (j + 1) / numMinor * tScale));
		}
	}
	obj.material.ambient = vec3(0.1, 0.1, 0.1);
	obj.material.diffuse = vec3(0.7, 0.7, 0.0);
	obj.material.specular = vec3(0.7, 0.7, 0.7);
	obj.material.emission = vec3(0.0, 0.0, 0.0);
	obj.material.shininess = 200;
	return obj;
}

function buildsightBead() {			// 准星
	var obj = new Obj(); // 新建一个Obj对象

	var size = 0.001, z = 0.0, dev = 0.0005;
	obj.vertices.push(vec3(-0.03, -0.03, 0.0));
	obj.vertices.push(vec3(0.03, -0.03, 0.0));
	obj.vertices.push(vec3(-0.03, 0.03, 0.0));
	obj.vertices.push(vec3(-0.03, 0.03, 0.0));
	obj.vertices.push(vec3(0.03, -0.03, 0.0));
	obj.vertices.push(vec3(0.03, 0.03, 0.0));

	// obj.normals.push(vec3(0, 1, 0));
	// obj.normals.push(vec3(0, 1, 0));
	// obj.normals.push(vec3(0, 1, 0));
	// obj.normals.push(vec3(0, 1, 0));
	// obj.normals.push(vec3(0, 1, 0));
	// obj.normals.push(vec3(0, 1, 0));

	obj.texcoords.push(vec2(0, 0));
	obj.texcoords.push(vec2(1, 0));
	obj.texcoords.push(vec2(0, 1));
	obj.texcoords.push(vec2(0, 1));
	obj.texcoords.push(vec2(1, 0));
	obj.texcoords.push(vec2(1, 1));

	obj.numVertices = 6;

	return obj;
}

// 获取shader中变量位置
function getLocation() {
	/*获取shader中attribute变量的位置(索引)*/
	program.a_Position = gl.getAttribLocation(program, "a_Position");
	if (program.a_Position < 0) { // getAttribLocation获取失败则返回-1
		console.log("获取attribute变量a_Position失败！");
	}
	program.a_Normal = gl.getAttribLocation(program, "a_Normal");
	if (program.a_Normal < 0) { // getAttribLocation获取失败则返回-1
		console.log("获取attribute变量a_Normal失败！");
	}
	program.a_Texcoord = gl.getAttribLocation(program, "a_Texcoord");
	if (program.a_Texcoord < 0) {
		console.log("获取attribute变量a_Texcoord失败！");
	}

	/*获取shader中uniform变量的位置(索引)*/
	program.u_ModelView = gl.getUniformLocation(program, "u_ModelView");
	if (!program.u_ModelView) { // getUniformLocation获取失败则返回null
		console.log("获取uniform变量u_ModelView失败！");
	}
	program.u_Projection = gl.getUniformLocation(program, "u_Projection");
	if (!program.u_Projection) { // getUniformLocation获取失败则返回null
		console.log("获取uniform变量u_Projection失败！");
	}
	program.u_NormalMat = gl.getUniformLocation(program, "u_NormalMat");
	if (!program.u_NormalMat) {
		console.log("获取uniform变量u_NormalMat失败！");
	}
	program.u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
	if (!program.u_LightPosition) {
		console.log("获取uniform变量u_LightPosition失败！");
	}
	program.u_Shininess = gl.getUniformLocation(program, "u_Shininess");
	if (!program.u_Shininess) {
		console.log("获取uniform变量u_Shininess失败！");
	}
	program.u_AmbientProduct = gl.getUniformLocation(program, "u_AmbientProduct");
	if (!program.u_AmbientProduct) {
		console.log("获取uniform变量u_AmbientProduct失败！");
	}
	program.u_DiffuseProduct = gl.getUniformLocation(program, "u_DiffuseProduct");
	if (!program.u_DiffuseProduct) {
		console.log("获取uniform变量u_DiffuseProduct失败！");
	}
	program.u_SpecularProduct = gl.getUniformLocation(program, "u_SpecularProduct");
	if (!program.u_SpecularProduct) {
		console.log("获取uniform变量u_SpecularProduct失败！");
	}
	program.u_Emission = gl.getUniformLocation(program, "u_Emission");
	if (!program.u_Emission) {
		console.log("获取uniform变量u_Emission失败！");
	}
	program.u_SpotDirection = gl.getUniformLocation(program, "u_SpotDirection");
	if (!program.u_SpotDirection) {
		console.log("获取uniform变量u_SpotDirection失败！");
	}
	program.u_SpotCutOff = gl.getUniformLocation(program, "u_SpotCutOff");
	if (!program.u_SpotCutOff) {
		console.log("获取uniform变量u_SpotCutOff失败！");
	}
	program.u_SpotExponent = gl.getUniformLocation(program, "u_SpotExponent");
	if (!program.u_SpotExponent) {
		console.log("获取uniform变量u_SpotExponent失败！");
	}
	program.u_LightSwitch = gl.getUniformLocation(program, "u_LightSwitch");
	if (!program.u_LightSwitch) {
		console.log("获取uniform变量u_LightSwitch失败！");
	}
	program.u_Sampler = gl.getUniformLocation(program, "u_Sampler");
	if (!program.u_Sampler) {
		console.log("获取uniform变量u_Sampler失败！");
	}
	program.u_Alpha = gl.getUniformLocation(program, "u_Alpha");
	if (!program.u_Alpha) {
		console.log("获取uniform变量u_Alpha失败！");
	}
	program.u_bOnlyTexture = gl.getUniformLocation(program, "u_bOnlyTexture");
	if (!program.u_bOnlyTexture) {
		console.log("获取uniform变量u_bOnlyTexture失败！");
	}
	program.u_DrawSelectedIF = gl.getUniformLocation(program, "u_DrawSelectedIF");
	if (!program.u_DrawSelectedIF) {
		console.log("获取uniform变量u_DrawSelectedIF失败！");
	}
	program.u_Color = gl.getUniformLocation(program, "u_Color");
	if (!program.u_Color) {
		console.log("获取uniform变量u_Color失败！");
	}


	// 获取prograObj中的attribu变量的位置（索引）
	attribIndex.a_Position = gl.getAttribLocation(programObj, "a_Position")
	if (attribIndex.a_Position < 0) {
		console.log("获取attribute变量a_Position失败！");
	}
	attribIndex.a_Normal = gl.getAttribLocation(programObj, "a_Normal")
	if (attribIndex.a_Normal < 0) {
		console.log("获取attribute变量a_Normal失败！");
	}
	attribIndex.a_Texcoord = gl.getAttribLocation(programObj, "a_Texcoord")
	if (attribIndex.a_Texcoord < 0) {
		console.log("获取attribute变量a_Texcoord失败！");
	}
	// 获取progrObj中的uniform变量的位置（索引）
	mtlIndex.u_Ka = gl.getUniformLocation(programObj, "u_Ka");
	if (!mtlIndex.u_Ka) {
		console.log("获取unifor变量u_Ka失败！");
	}
	mtlIndex.u_Kd = gl.getUniformLocation(programObj, "u_Kd");
	if (!mtlIndex.u_Kd) {
		console.log("获取unifor变量u_Kd失败！");
	}
	mtlIndex.u_Ks = gl.getUniformLocation(programObj, "u_Ks");
	if (!mtlIndex.u_Ks) {
		console.log("获取unifor变量u_Ks失败！");
	}
	mtlIndex.u_Ke = gl.getUniformLocation(programObj, "u_Ke");
	if (!mtlIndex.u_Ke) {
		console.log("获取unifor变量u_Ke失败！");
	}
	mtlIndex.u_Ns = gl.getUniformLocation(programObj, "u_Ns");
	if (!mtlIndex.u_Ns) {
		console.log("获取unifor变量u_Ns失败！");
	}
	mtlIndex.u_d = gl.getUniformLocation(programObj, "u_d");
	if (!mtlIndex.u_d) {
		console.log("获取unifor变量u_d失败！");
	}

	programObj.u_ModelView = gl.getUniformLocation(programObj, "u_ModelView");
	if (!programObj.u_ModelView) {
		console.log("获取unifo变量u_ModelView失败!");
	}
	programObj.u_Projection = gl.getUniformLocation(programObj, "u_Projection");
	if (!programObj.u_Projection) {
		console.log("获取unifo变量u_Projection失败!");
	}
	programObj.u_NormalMat = gl.getUniformLocation(programObj, "u_NormalMat");
	if (!programObj.u_NormalMat) {
		console.log("获取unifo变量u_NormalMat失败!");
	}
	programObj.u_LightPosition = gl.getUniformLocation(programObj, "u_LightPosition");
	if (!programObj.u_LightPosition) {
		console.log("获取unifo变量u_LightPosition失败!");
	}
	programObj.u_AmbientLight = gl.getUniformLocation(programObj, "u_AmbientLight");
	if (!programObj.u_AmbientLight) {
		console.log("获取unifo变量u_AmbientLight失败!");
	}
	programObj.u_DiffuseLight = gl.getUniformLocation(programObj, "u_DiffuseLight");
	if (!programObj.u_DiffuseLight) {
		console.log("获取unifo变量u_DiffuseLight失败!");
	}
	programObj.u_SpecularLight = gl.getUniformLocation(programObj, "u_SpecularLight");
	if (!programObj.u_SpecularLight) {
		console.log("获取unifo变量u_SpecularLight失败!");
	}
	programObj.u_Sampler = gl.getUniformLocation(programObj, "u_Sampler");
	if (!programObj.u_Sampler) {
		console.log("获取unifo变量u_Sampler失败!");
	}
	programObj.u_Sampler = gl.getUniformLocation(programObj, "u_Sampler");
	if (!programObj.u_Sampler) {
		console.log("获取unifo变量u_Sampler失败!");
	}
	programObj.u_SpotDirection = gl.getUniformLocation(programObj, "u_SpotDirection");
	if (!programObj.u_SpotDirection) {
		console.log("获取unifo变量u_SpotDirection失败!");
	}
	programObj.u_SpotCutOff = gl.getUniformLocation(programObj, "u_SpotCutOff");
	if (!programObj.u_SpotCutOff) {
		console.log("获取unifo变量u_SpotCutOff失败!");
	}
	programObj.u_SpotExponent = gl.getUniformLocation(programObj, "u_SpotExponent");
	if (!programObj.u_SpotExponent) {
		console.log("获取unifo变量u_SpotExponent失败!");
	}
	programObj.u_LightSwitch = gl.getUniformLocation(programObj, "u_LightSwitch");
	if (!programObj.u_LightSwitch) {
		console.log("获取unifo变量u_LightSwitch失败!");
	}
}

var ground = buildGround(20.0, 0.5); // 生成地面对象
var Face = buildFace(2.0, 0.5);	// 生成一个面
var numSpheres = 85;  // 场景中球的数目
// 用于保存球位置的数组，对每个球位置保存其x、z坐标
var posSphere = [];
var sphere = buildSphere(0.2, 15, 15); // 生成球对象
var posSphereFS = [];
var sphereFS = buildSphereForSelect(0.2, 15, 15);
var drawSphereON = [];
var sightBead = buildsightBead();
var torus = buildTorus(0.35, 0.15, 40, 20); // 生成圆环对象
// 初始化场景中的几何对象
function initObjs() {
	// 初始化地面顶点数据缓冲区对象(VBO)
	ground.initBuffers();
	// 初始化地面纹理，纹理图为RGB图像，先不使用mipmapping
	ground.texObj = loadTexture("Res/ground.jpg", gl.RGB, true);

	// 初始化广告面顶点数据缓冲区对象
	Face.initBuffers();
	// 初始化纹理
	Face.texObj = loadTexture("Res/Face.jpg", gl.RGB, false);

	// 随机放置球的位置
	for (var iSphere = 0; iSphere < numSpheres; iSphere++) {
		// 在 -sizeGround 和 sizeGround 间随机选择一位置
		var x = Math.random() * sizeGround * 2 - sizeGround;
		var z = Math.random() * sizeGround * 2 - sizeGround;
		var y = Math.random();
		posSphere.push(vec3(x, y, z));
		posSphereFS.push(vec3(x, y, z));
	}

	// 初始化旋转球纹理
	RedLightTexObj = loadTexture("Res/sun.bmp", gl.RGB, true);
	// 初始化天空球纹理
	skyTexObj = loadTexture("Res/sky3.jpg", gl.RGB, true);
	skyTexObj2 = loadTexture("Res/stars.bmp", gl.RGB, true);
	CubeTex = loadTexture("Res/aimHero.jpg", gl.RGB, false);

	// 初始化球顶点数据缓冲区对象(VBO)
	sphere.initBuffers();
	// 初始化球纹理
	sphere.texObj = loadTexture("Res/sphere2.jpg", gl.RGB, true);

	sphereFS.initBuffers();

	// 初始化圆环顶点数据缓冲区对象(VBO)
	torus.initBuffers();
	// 初始化圆环纹理
	torus.texObj = loadTexture("Res/torus.jpg", gl.RGB, true);

	// 初始化准星顶点数据缓冲区对象
	sightBead.initBuffers();
	// 初始化准星纹理
	sightBead.texObj = loadTexture("Res/aim.png", gl.RGBA, true);
}

// 页面加载完成后调用
window.onload = function main() {
	for (i = 0; i < numSpheres; i++) {
		drawSphereON[i] = true;
	}
	// 获取页面中id位hud的canvas元素
	hud = document.getElementById("hud");
	if (!hud) {
		alert("获取hud元素失败！");
		return;
	}
	gl = WebGLUtils.setupWebGL(canvas, { alpha: false });
	if (!gl) {
		alert("获取WebGL上下文失败！");
		return;
	}
	ctx = hud.getContext('2d');
	/*设置WebGL相关属性*/
	gl.clearColor(0.0, 0.5, 1.0, 0.7); // 设置背景色为灰色
	gl.enable(gl.DEPTH_TEST);	// 开启深度检测
	gl.enable(gl.CULL_FACE);	// 开启面剔除
	// 设置视口，占满整个canvas
	gl.viewport(0, 0, canvas.width, canvas.height);
	// 开启混合，设置混合方式
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	// 编译链接新的shader程序对象，使用的顶点shader与上面相同
	// 但片元shader不同
	programObj = initShaders(gl, "vertex-shader", "fragment-shaderNew");
	gl.useProgram(program);	// 启用该shader程序对象 
	/*hud.onmousedown = function(ev){
		check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Click, )
	}*/
	// 获取shader中变量位置
	getLocation();
	// 设置投影矩阵：透视投影，根据视口宽高比指定视域体
	matProj = perspective(35.0, 		// 垂直方向视角
		canvas.width / canvas.height, 	// 视域体宽高比
		0.1, 							// 相机到近裁剪面距离
		3000.0);							// 相机到远裁剪面距离
	matOrthoPorj = ortho(-1.0, 1.0, -0.6, 0.6, 0.0, 0.001);	// 正交投影矩阵
	// 传投影矩阵
	gl.uniformMatrix4fv(program.u_Projection, false, flatten(matProj));
	// 传纹理，只用了0号纹理单元
	gl.uniform1i(program.u_Sampler, 0);
	gl.useProgram(programObj);	// 启用新的programObj
	// 传同样的投影矩阵
	gl.uniformMatrix4fv(programObj.u_Projection, false, flatten(matProj));
	// 初始化场景中的几何对象
	initObjs();
	// 初始化场景中的光源
	initLights();
	// 初始化拾取用FBO
	initFrameBufferForSelect();

	canvas.addEventListener("mousemove", function (event) {
		if (document.pointerLockElement) {
			console.log(event.movementX, event.movementY);
			Xmove = event.movementX;
			Ymove = event.movementY;
			// updateCamera();
		}
	}, false);

	canvas.addEventListener('mousedown', function (event) {
		console.log("鼠标点击");
		Score++;
		if (event.button == 0) {
			var id = getSelectedObj(950, 450);
			if (id >= 0) {
				drawSphereON[id] = false;
				Score++;
				// requestAnimFrame(render);
			}
		}
	}, false);

	render();
}

function getPixels(x, y){
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOforSelect);
	var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
	if(status ==  gl.FRAMEBUFFER_COMPLETE){
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
}

// hud绘制
function drawHUD() {
	ctx.clearRect(0, 0, 1900, 900);	// 清楚<hud>

	// 用白色线描绘方框
	ctx.beginPath();
	ctx.moveTo(1200, 20);
	ctx.lineTo(1470, 20);
	ctx.lineTo(1470, 160);
	ctx.lineTo(1200, 160);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(20, 20);
	ctx.lineTo(550, 20);
	ctx.lineTo(550, 160);
	ctx.lineTo(20, 160);
	ctx.closePath();
	ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
	ctx.stroke();

	// 白色字体
	ctx.font = '20px "Times New Roman"';
	ctx.fillStyle = 'rgba(255, 255, 255, 1)';
	ctx.fillText('试着射击圆球', 1230, 50);
	ctx.font = '30px "Times New Roman"';
	ctx.fillText('得分： ', 1230, 100)
	ctx.font = '55px "Times New Roman"';
	ctx.fillText(Score, 1350, 120)
	ctx.font = '35px "Times New Roman"';
	ctx.fillText('图形学游戏提示：', 30, 60);
	ctx.font = '15px "Times New Roman"';
	ctx.fillText('按下"W","A","S","D"进行移动，移动鼠标进行瞄准，单击左键进行射击', 30, 100);
	ctx.fillText('按下"K"锁定光标，按下"P"退出光标锁定', 30, 120);
	ctx.fillText('按下"R"重新开始', 30, 140);
	ctx.font = '24px "Times New Roman"';
	// ctx.fillText('Made by Azrael-Copeland', 1600, 20);
}

// 按键响应
window.onkeydown = function () {
	switch (event.keyCode) {
		case 38:	// Up
			matReverse = mult(matReverse, translate(0.0, 0.0, -0.1));
			matCamera = mult(translate(0.0, 0.0, 0.1), matCamera);
			break;
		case 40:	// Down
			matReverse = mult(matReverse, translate(0.0, 0.0, -0.1));
			matCamera = mult(translate(0.0, 0.0, -0.1), matCamera);
			break;
		case 37:	// Left
			matReverse = mult(matReverse, rotateY(1));
			matCamera = mult(rotateY(-1), matCamera);
			break;
		case 39:	// Right
			matReverse = mult(matReverse, rotateY(-1));
			matCamera = mult(rotateY(1), matCamera);
			break;
		case 87:	// W
			keyDown[0] = true;
			break;
		case 83:	// S
			keyDown[1] = true;
			break;
		case 65:	// A
			keyDown[2] = true;
			break;
		case 68:	// D
			keyDown[3] = true;
			break;
		case 32: 	// space
			if (!jumping) {
				jumping = true;
				jumpTime = 0;
			}
			break;
		case 17:
			matReverse = mult(matReverse, translate(0.0, -0.025, 0.0));
			matCamera = mult(translate(0.0, 0.025, 0.0), matCamera);
			break;
		case 75:	// K
			canvas.requestPointerLock();
			console.log("按键K锁定光标");
			break;
		case 80:	// P
			document.exitPointerLock();
			console.log("按键P解锁光标");
			break;
		case 51:	// 3
			lights[2].switch = !lights[2].switch;
			passLightSwitch();
			break;
		case 52: 	// 4
			if (LIGHTS) {
				LIGHTS = false;
				gl.uniform1i(program.u_bOnlyTexture, 0);
			}
			else {
				LIGHTS = true;
				gl.uniform1i(program.u_bOnlyTexture, 1);
			}
			break;
		case 82:
			Restart = true;
			break;
	}
	// 禁止默认处理
	event.preventDefault();
}

// 按键弹起响应
window.onkeyup = function () {
	switch (event.keyCode) {
		case 87:	// W
			keyDown[0] = false;
			break;
		case 83:	// S
			keyDown[1] = false;
			break;
		case 65:	// A
			keyDown[2] = false;
			break;
		case 68:	// D
			keyDown[3] = false;
			break;
		case 17:
			matReverse = mult(matReverse, translate(0.0, 0.025, 0.0));
			matCamera = mult(translate(0.0, -0.025, 0.0), matCamera);
			break;
	}
}
// 记录上一次调用函数的时刻
var last = Date.now();

// 根据时间更新旋转角度
function animation() {
	// 计算距离上次调用经过多长的时间
	var now = Date.now();
	var elapsed = (now - last) / 1000.0; // 秒
	last = now;

	// 更新动画状态
	yRot += deltaAngle * elapsed;

	zRot += deltaAngle * elapsed / 5;

	// 防止溢出
	yRot %= 360;
	zRot %= 360;

	// 跳跃处理
	jumpTime += elapsed;
	if (jumping) {
		jumpY = initSpeed * jumpTime - 0.5 * g * jumpTime * jumpTime;
		if (jumpY <= 0) {
			jumpY = 0;
			jumping = false;
		}
	}
}

// 更新照相机变换
function updateCamera() {
	var xM = Ymove / 400 * 45;
	var yM = Xmove / 400 * 35;
	// console.log("Xmove:" + Xmove + ";Ymove" + Ymove);
	Xmove = Ymove = 0;
	// console.log("xM:" + xM + ";yM" + yM);
	matCameraY = mult(rotateX(-LevelY), matCameraY);
	matCamera = mult(rotateY(yM), matCamera);
	LevelY += xM;
	if (LevelY > 80.0) {
		LevelY = 80;
	}
	else if (LevelY < -80.0) {
		LevelY = -80;
	}
	//console.log(currentAngle[0]);
	matCameraY = mult(rotateX(LevelY), matCameraY);
	// 照相机前进
	if (keyDown[0]) {
		matReverse = mult(matReverse, translate(0.0, 0.0, -0.1));
		matCamera = mult(translate(0.0, 0.0, 0.01), matCamera);
	}
	// 照相机后退
	if (keyDown[1]) {
		matReverse = mult(matReverse, translate(0.0, 0.0, 0.1));
		matCamera = mult(translate(0.0, 0.0, -0.01), matCamera);
	}
	// 照相机左移动
	if (keyDown[2]) {
		matReverse = mult(matReverse, translate(-0.1, 0.0, 0.0));
		matCamera = mult(translate(0.005, 0.0, 0.0), matCamera);
	}
	// 照相机右移动
	if (keyDown[3]) {
		matReverse = mult(matReverse, translate(0.1, 0.0, 0.0));
		matCamera = mult(translate(-0.005, 0.0, 0.0), matCamera);
	}
}

// 绘制函数
function render() {
	// 检查是否一切准备就绪，否则请求重回并返回
	// 这样稍后系统会再次调用render重新检查相关状态
	if (!obj.isAllReady(gl)) {
		requestAnimFrame(render);	// 请求重绘
		return; // 返回（中断）
	}

	if (Restart) {	// 重开当局

		/* 对显示帧和离屏帧中的物体的位置信息清零 */
		posSphere.length = 0;
		posSphereFS.length = 0;

		/* 重新设置信息 */
		for (var iSphere = 0; iSphere < numSpheres; iSphere++) {
			// 在 -sizeGround 和 sizeGround 间随机选择一位置
			var x = Math.random() * sizeGround * 2 - sizeGround;
			var z = Math.random() * sizeGround * 2 - sizeGround;
			var y = Math.random();
			posSphere.push(vec3(x, y, z));
			posSphereFS.push(vec3(x, y, z));
			drawSphereON[iSphere] = true;
		}
		Restart = false;
		Score = 0;
	}
	animation(); // 更新动画参数
	updateCamera(); // 更新相机变换
	// 清颜色缓存和深度缓存
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// 模视投影矩阵初始化为投影矩阵*照相机变换矩阵
	matMV = mult(matCameraY, matCamera);	//  实现相机
	matMV = mult(translate(0, -jumpY, 0), matMV);
	// 为光源位置数组传值
	var lightPositions = [];
	// 决定旋转球位置的变换
	//var matRotatingSphere = mult(matMV,  translate(0.0, 0.0, 0.0));
	lightPositions.push(mult(translate(0.0, 20.0, 0.0), lightSun.pos));
	lightPositions.push(mult(translate(0.0, 20.0, 0.0), lightRed.pos));
	lightPositions.push(lightYellow.pos);

	// 观察坐标系下光源位置/方向
	gl.useProgram(program);
	gl.uniform4fv(program.u_LightPosition, flatten(lightPositions));
	gl.useProgram(programObj);
	gl.uniform4fv(programObj.u_LightPosition, flatten(lightPositions));

	// 绘制obj模型
	// gl.useProgram(programObj);
	// mvStack.push(matMV);
	// matMV = mult(matMV, translate(0.0, 0.0, -1.0));
	// matMV = mult(matMV, scale(0.1, 0.1, 0.1));
	// gl.uniformMatrix4fv(programObj.u_ModelView, false, flatten(matMV));
	// gl.uniformMatrix3fv(programObj.u_NormalMat, false, flatten(normalMatrix(matMV)));
	// obj.draw(gl, attribIndex, mtlIndex, programObj.u_Sampler);
	// matMV = mvStack.pop();

	// 绘制世界
	gl.useProgram(program);	// 后面的对象使用的都是program而并非programObj
	// 绘制天空球
	mvStack.push(matMV);	// 不让对天空球的变换影响到后面的对象
	matMV = mult(matMV, scale(2000.0, 2000.0, 2000.0));
	matMV = mult(matMV, rotateX(90))	// 调整南北极
	// 绘制天空球，材质无所谓，因为关闭了光照计算
	// 使用了天空球的纹理
	gl.disable(gl.CULL_FACE);	// 关闭背面剔除
	gl.uniform1i(program.u_bOnlyTexture, 1);	// 设u_bOnlyTexture为真
	if (DoN) {	// 判定是日夜，加载不同的天空球纹理对象
		sphere.draw(matMV, null, skyTexObj);
	}
	else {
		sphere.draw(matMV, null, skyTexObj2);
	}
	//sphere.draw(matMV, null, skyTexObj);
	gl.uniform1i(program.u_bOnlyTexture, 0);	// 绘制完了设为假
	gl.enable(gl.CULL_FACE);	// 重新开启背面剔除
	matMV = mvStack.pop();
	/*绘制地面*/
	mvStack.push(matMV);
	// 将地面移到y=-0.4平面上
	matMV = mult(matMV, scale(1.5, 1.5, 1.5));
	matMV = mult(matMV, translate(0.0, -0.4, 0.0));
	ground.draw(matMV);
	matMV = mvStack.pop();
	/*绘制每个球体*/
	for (var i = 0; i < numSpheres; i++) {
		if (drawSphereON[i]) {
			mvStack.push(matMV);
			matMV = mult(matMV, translate(posSphere[i][0],
				posSphere[i][1], posSphere[i][2])); // 平移到相应位置
			matMV = mult(matMV, scale(0.8, 0.8, 0.8));
			matMV = mult(matMV, rotateX(90)); // 调整南北极
			sphere.draw(matMV, null, null);
			matMV = mvStack.pop();
		}
	}
	// 将后面的模型往-z轴方向移动
	// 使得它们位于摄像机前方(也即世界坐标系原点前方)
	matMV = mult(matMV, translate(0.0, 0.0, -2.5));
	/*绘制自转的圆环*/
	mvStack.push(matMV);
	matMV = mult(matMV, translate(0.0, 0.1, 0.0));
	matMV = mult(matMV, rotateY(yRot));
	torus.draw(matMV);
	matMV = mvStack.pop();
	/*绘制太阳球*/
	mvStack.push(matMV); // 使得下面对球的变换不影响后面绘制的圆环
	// 调整南北极后先旋转再平移
	//matMV = mult(matMV, rotateZ(zRot));
	matMV = mult(matMV, translate(0.0, 20.0, 0.0));
	matMV = mult(matMV, rotateX(90)); // 调整南北极
	matMV = mult(matMV, scale(2.0, 2.0, 2.0));
	if (lights[1].switch) {
		sphere.draw(matMV, mtlRedLight, RedLightTexObj);
	}
	else {
		sphere.draw(matMV, mtlRedLightOff, RedLightTexObj);
	}
	matMV = mvStack.pop();
	// drawCube(matMV);
	var MAT = mat4();
	MAT = mult(MAT, scale(0.5, 0.5, 1.0));
	gl.uniform1i(program.u_bOnlyTexture, 1);	// 设u_bOnlyTexture为真
	gl.uniformMatrix4fv(program.u_Projection, false, flatten(matOrthoPorj));
	sightBead.draw(MAT, null);
	gl.uniform1i(program.u_bOnlyTexture, 0);
	gl.uniformMatrix4fv(program.u_Projection, false, flatten(matProj));
	drawHUD();
	requestAnimFrame(render);
}

function drawCube(matMV) {
	mvStack.push(matMV);
	matMV = mult(matMV, translate(0.0, 2.0, -10.0));
	matMV = mult(matMV, rotateX(180));
	Face.draw(matMV, null, CubeTex);
	matMV = mvStack.pop();
}