"use strict";

var gl;
var canvas;
var program;


var objects3d = [];//set of all of the 3d objects to draw


//Map
var numVertex1 = 0;
var points1 = [];
var colors1 = [];
var texCoordsArray = [];
var cBuffer1, vColor1, vBuffer1;
var textBuffer;


var mvMatrixLoc;
var projectionMatrixLoc;
var objectTransformationLoc;
var uniformUseTextureBoolean;
var textureUniform;

var black = [ 0.0, 0.0, 0.0, 1.0 ]; 
var red = [ 1.0, 0.0, 0.0, 1.0 ]; 
var yellow = [ 1.0, 1.0, 0.0, 1.0 ]; 
var green = [ 0.0, 1.0, 0.0, 1.0 ]; 
var blue = [ 0.0, 0.0, 1.0, 1.0 ]; 
var magenta = [ 1.0, 0.0, 1.0, 1.0 ]; 
var cyan = [ 0.0, 1.0, 1.0, 1.0 ]; 
var white = [ 1.0, 1.0, 1.0, 1.0 ];
var orange = [ 1.0, 0.5, 0.0, 1.0 ]; 

window.onload = function init()
{
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    onLoad();
}

function onLoad(){

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    crearMapa();
    initTextures()

    gl.viewport( 0, 0, canvas.width, canvas.height );
    var clearColor = black;
    gl.clearColor( clearColor[0], clearColor[1], clearColor[2], 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.FRONT);

    //Map
    cBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors1), gl.STATIC_DRAW );

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );

    textBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, textBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );


    
	mvMatrixLoc = gl.getUniformLocation(program, "uMVMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    objectTransformationLoc = gl.getUniformLocation(program, "objectTransformation");
    uniformUseTextureBoolean = gl.getUniformLocation(program, "useTexture");
    textureUniform = gl.getUniformLocation(program, "texture");

    var sphere = new Sphere(gl, program, 4, black);
    sphere.setScale(0.25,0.25,0.25);
    sphere.setTranslation(0.7,-0.7,-0.5);
    objects3d.push(sphere);

    //pistola
    var pistola = new ObjFileObject(gl,program, "M1911.json" ,earthTexture)
    pistola.setScale(0.1,0.1,0.1);
    pistola.setTranslation(0.1,0.1,0);
    pistola.addRotation(90,[0,1,0])
    objects3d.push(pistola);

    //cilindre
    var revSolid = new cosRevolucio(gl, program, (x=>1), (x => x), 14, 140, green);
    revSolid.setScale(0.3,0.3,0.3);
    revSolid.setTranslation(-0.4,0.6,-0.5);
    revSolid.addRotation(20, [0,0,1]);
    revSolid.addRotation(40, [1,0,0]);
    objects3d.push(revSolid);

    //copa martini
    var xvalues = [0,1,0.1,0.1,0.3,0.3];
    var yvalues = [1,1,0,-0.9,-0.9,-1];
    revSolid = new cosRevolucio(gl, program, xvalues, yvalues, xvalues.length, 140, cyan);
    revSolid.setScale(0.3,0.3,0.3);
    revSolid.setTranslation(-0.7,-0.7,-0.5);
    objects3d.push(revSolid);

    var t1 = 0, t2 = -0.7, t3 = -0.5;

    revSolid = new cosRevolucio(gl, program, (x=>x),(x => x), 14, 140, [0.2,0.6,0,1]);
    revSolid.setScale(0.3,0.3,0.3);
    revSolid.setTranslation(t1,t2,t3);
    objects3d.push(revSolid);    


    revSolid = new cosRevolucio(gl, program, (x=>x),(x => -x), 14, 140, [0.2,0.8,0,1]);
    revSolid.setScale(0.3,0.3,0.3);
    revSolid.setTranslation(t1,t2,t3);
    objects3d.push(revSolid);    

    render();
}

//Mapa
function crearMapa(){
    var x=0.0, y=0, z=0;

    var size=1.25;
    var sizeX=size, sizeY=size, sizeZ=size;
    quad( //terra
        vec3(-sizeX+x,-sizeY+y, sizeZ+z),
        vec3(-sizeX+x,-sizeY+y,-sizeZ+z),
        vec3( sizeX+x,-sizeY+y, sizeZ+z),
        vec3( sizeX+x,-sizeY+y,-sizeZ+z),
        blue
    );
    quad( //paret esquerra
        vec3(-sizeX+x,-sizeY+y, sizeZ+z),
        vec3(-sizeX+x,-sizeY+y,-sizeZ+z),
        vec3(-sizeX+x, sizeY+y, sizeZ+z),
        vec3(-sizeX+x, sizeY+y,-sizeZ+z),
        red
    );
    quad( //paret dreta
        vec3( sizeX+x,-sizeY+y, sizeZ+z),
        vec3( sizeX+x,-sizeY+y,-sizeZ+z),
        vec3( sizeX+x, sizeY+y, sizeZ+z),
        vec3( sizeX+x, sizeY+y,-sizeZ+z),
        orange
    );
    quad( //paret anterior
        vec3(-sizeX+x,-sizeY+y,-sizeZ+z),
        vec3(-sizeX+x, sizeY+y,-sizeZ+z),
        vec3( sizeX+x,-sizeY+y,-sizeZ+z),
        vec3( sizeX+x, sizeY+y,-sizeZ+z),
        yellow
    );
    quad( //sostre
        vec3(-sizeX+x, sizeY+y,-sizeZ+z),
        vec3(-sizeX+x, sizeY+y, sizeZ+z),
        vec3( sizeX+x, sizeY+y,-sizeZ+z),
        vec3( sizeX+x, sizeY+y, sizeZ+z),
        cyan
    );
}

function quad(p1, p2, p3, p4, color){
    var vertices = [ p1, p2, p3, p2, p3, p4];

    var texCoord = [
        vec2(0, 0),
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];

    for(var i=0;i<vertices.length;i++){
        points1.push(vertices[i]);
        colors1.push(color);
        numVertex1++;
    }
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[2]);
}

//Interacció WASD
var currentlyPressedKeys = {};
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}
function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
}

var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;
var xPos = 0;
var yPos = 0.4;
var zPos = 5.0;
var speed = 0;

function handleKeys() {
    let yawRate2 =0.075
	if (currentlyPressedKeys[33]) {
		// Page Up
		pitchRate = 0.1;
	} else if (currentlyPressedKeys[34]) {
		// Page Down
		pitchRate = -0.1;
	} else {
		pitchRate = 0;
	}
	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
		// Left cursor key or A
        yawRate = yawRate2;
	} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
		// Right cursor key or D
		yawRate = -yawRate2;
	} else {
		yawRate = 0;
	}
	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
		// Up cursor key or W
		speed = 0.003;
	} else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
		// Down cursor key
		speed = -0.003;
	} else {
		speed = 0;
	}
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var lastTime = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        if (speed != 0) {
            let distance = speed * elapsed;
            xPos -= Math.sin(degToRad(yaw)) * distance;
            zPos -= Math.cos(degToRad(yaw)) * distance;
            yPos -=  Math.tan(degToRad(-pitch)) * distance;
            joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
        }
        yaw += yawRate * elapsed;
        pitch += pitchRate * elapsed;
    }
    lastTime = timeNow;
}




//Handling textures!
function handleLoadedTexture(texture) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

var earthTexture;
var galvanizedTexture;
var bananaTexture;

function initTextures() {
    earthTexture = gl.createTexture();
    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(earthTexture)
    }
    earthTexture.image.src = "earth.jpg";

    galvanizedTexture = gl.createTexture();
    galvanizedTexture.image = new Image();
    galvanizedTexture.image.onload = function () {
        handleLoadedTexture(galvanizedTexture)
    }
    galvanizedTexture.image.src = "arroway.de_metal+structure+06_d100_flat.jpg";

    bananaTexture = gl.createTexture();
    bananaTexture.image = new Image();
    bananaTexture.image.onload = function () {
        handleLoadedTexture(bananaTexture)
    }
    bananaTexture.image.src = "Banana.jpg";
}

//Render
var mvMatrix = mat4();
var Identity = mat4();
var mvMatrixStack = [];

var near = 0.1;
var far = 50;
var left = -1.0;
var right = 1.0;
var ytop = 1.0;
var bottom = -1.0;

function render()
{
    handleKeys();

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    Identity = mat4();
    mvMatrix = mat4();
    var rotation1 = rotate(-pitch, [1, 0, 0]);
    var rotation2 = rotate(-yaw, [0, 1, 0]);
    var translation = translate(-xPos, -yPos, -zPos);

    var rotation = mult(rotation1, rotation2);
    var movment = mult(rotation, translation);
    mvMatrix = mult(mvMatrix, movment);

    var projectionMatrix = perspective(45, canvas.width / canvas.height, near, far);

    gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mvMatrix) );       
    gl.uniformMatrix4fv(objectTransformationLoc, false, flatten(Identity) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );      

    //Map
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer1  );
    let vertexColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vertexColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexColor );

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    let vertexPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPos);

    gl.bindBuffer( gl.ARRAY_BUFFER, textBuffer );
    let vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );


    //carraguem textures
    gl.uniform1i(textureUniform, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
    gl.uniform1i(uniformUseTextureBoolean, 1);

   
    gl.drawArrays( gl.TRIANGLES, 0, numVertex1 );
    //gl.drawElements(gl.TRIANGLES, teapotVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    // per si necessitem fer un buffer d'elements (ns en q es diferencien)

    //drawing the 3d obejcts
    for(var i=0;i<objects3d.length;i++){
        gl.uniform1i(uniformUseTextureBoolean, 0); //no volem textures en els cosos 3d d'aquí        
        objects3d[i].draw();
    }
        

    animate();

    objects3d[5].addRotation(1, [1,0,0]);
    objects3d[4].addRotation(1, [1,0,0]);


    requestAnimFrame( render );
}
