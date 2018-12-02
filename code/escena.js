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
var normalBuffer;


var mvMatrixLoc;
var projectionMatrixLoc;
var objectTransformationLoc;
var uniformUseTextureBoolean;
var textureUniform;
var uNMatrix;

var materialShininessUniform;
var showSpecularHighlightsUniform;

var useLightingUniform;
var ambientColorUniform;
var ambientColorUniform;
var pointLightingLocationUniform;
var pointLightingSpecularColorUniform;
var pointLightingDiffuseColorUniform;

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
    initTextures();
    computeNormals();

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

    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalVertices), gl.STATIC_DRAW );


    
	mvMatrixLoc = gl.getUniformLocation(program, "uMVMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    objectTransformationLoc = gl.getUniformLocation(program, "objectTransformation");
    uniformUseTextureBoolean = gl.getUniformLocation(program, "useTexture");
    textureUniform = gl.getUniformLocation(program, "texture");
    uNMatrix = gl.getUniformLocation(program, "uNMatrix");


    materialShininessUniform = gl.getUniformLocation(program, "uMaterialShininess");
    showSpecularHighlightsUniform = gl.getUniformLocation(program, "uShowSpecularHighlights");

    useLightingUniform = gl.getUniformLocation(program, "uUseLighting");
    ambientColorUniform = gl.getUniformLocation(program, "uAmbientColor");
    pointLightingLocationUniform = gl.getUniformLocation(program, "uPointLightingLocation");
    pointLightingSpecularColorUniform = gl.getUniformLocation(program, "uPointLightingSpecularColor")
    pointLightingDiffuseColorUniform = gl.getUniformLocation(program, "uPointLightingDiffuseColor");

    //objecteObj
    var objecteObj = new ObjFileObject(gl,program, "M1911.json" ,earthTexture)
    objecteObj.setScale(0.1,0.1,0.1);
    objecteObj.setTranslation(0.1,0.1,0);
    objecteObj.addRotation(90,[0,1,0])
    objects3d.push(objecteObj);

    objecteObj = new ObjFileObject(gl,program, "Banana.json" ,bananaTexture)
    objecteObj.setScale(0.3,0.3,0.3);
    objecteObj.setTranslation(-0.7,-0.7,-0.5);
    objects3d.push(objecteObj);

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

class Face{
    constructor(vec1, vec2, vec3){
        this.vec1 = vec1;
        this.vec2 = vec2;
        this.vec3 = vec3;
        this.normal = undefined;
        this.calculateNormal();
    }
    getNormal(){
        return this.normal
    }
    calculateNormal(){
        let comp1 = vec3((this.vec2[0]-this.vec1[0]),
                         (this.vec2[1]-this.vec1[1]),
                         (this.vec2[2]-this.vec1[2]));
        let comp2 = vec3((this.vec3[0]-this.vec1[0]),
                         (this.vec3[1]-this.vec1[1]),
                         (this.vec3[2]-this.vec1[2]));
        let normX = comp1[1]*comp2[2] - comp1[2]*comp2[1];
        let normY = comp1[2]*comp2[0] - comp1[0]*comp2[2];
        let normZ = comp1[0]*comp2[1] - comp1[1]*comp2[0];
        this.normal = vec3(normX,normY,normZ);
    }
    contains(vector){
        let bool1 = (this.vec1[0] == vector[0]) && (this.vec1[1] == vector[1]) && (this.vec1[2] == vector[2]);
        let bool2 = (this.vec2[0] == vector[0]) && (this.vec2[1] == vector[1]) && (this.vec2[2] == vector[2]);
        let bool3 = (this.vec3[0] == vector[0]) && (this.vec3[1] == vector[1]) && (this.vec3[2] == vector[2]);
        return bool1||bool2||bool3;
    }

}

var FaceVec = []

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
    FaceVec.push(new Face(p1,p2,p3));
    FaceVec.push(new Face(p2,p3,p4));
    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[3]);
    texCoordsArray.push(texCoord[2]);
}

var normalVertices = [];

function computeNormals(){
    for(var i =0; i<points1.length; i++){
        let faces = [];
        for(var j = 0; j<FaceVec.length; j++){
            if (FaceVec[j].contains(points1[i])) faces.push(FaceVec[j]);
        }
        let vertexNormX = 0;
        let vertexNormY = 0;
        let vertexNormZ = 0;
        for (var j = 0; j<faces.length; j++){
            let normal = faces[j].getNormal();
            vertexNormX+= normal[0];
            vertexNormY+= normal[1];
            vertexNormZ+= normal[2];
        }
        normalVertices.push(vec3(vertexNormX/faces.length,vertexNormY/faces.length,vertexNormZ/faces.length));

    }
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


//codi Prestat de la llibreria glMatrix-0.9.6.min.js
function toInverseMat3(a,b){
    var c=a[0], d=a[1], e=a[2], g=a[4], f=a[5], h=a[6], i=a[8], j=a[9], k=a[10];
    var l=k*f-h*j, o=-k*g+h*i, m=j*g-f*i, n=c*l+d*o+e*m;
    if(!n) return null;
    n=1/n;
    b||(b=mat3());
    b[0]=l*n;
    b[1]=(-k*d+e*j)*n;
    b[2]=(h*d-e*f)*n;
    b[3]=o*n;b[4]=(k*c-e*i)*n;
    b[5]=(-h*c+e*g)*n;
    b[6]=m*n;b[7]=(-j*c+d*i)*n;
    b[8]=(f*c-d*g)*n;
    return b
};

function setUniforms(){
    var specularHighlights = document.getElementById("specular").checked;
        gl.uniform1i(showSpecularHighlightsUniform, specularHighlights);

    var lighting = document.getElementById("lighting").checked;
        gl.uniform1i(useLightingUniform, lighting);
        if (lighting) {
            gl.uniform3f(
                ambientColorUniform,
                parseFloat(document.getElementById("ambientR").value),
                parseFloat(document.getElementById("ambientG").value),
                parseFloat(document.getElementById("ambientB").value)
            );

            gl.uniform3f(
                pointLightingLocationUniform,
                parseFloat(document.getElementById("lightPositionX").value),
                parseFloat(document.getElementById("lightPositionY").value),
                parseFloat(document.getElementById("lightPositionZ").value)
            );

            gl.uniform3f(
                pointLightingSpecularColorUniform,
                parseFloat(document.getElementById("specularR").value),
                parseFloat(document.getElementById("specularG").value),
                parseFloat(document.getElementById("specularB").value)
            );

            gl.uniform3f(
                pointLightingDiffuseColorUniform,
                parseFloat(document.getElementById("diffuseR").value),
                parseFloat(document.getElementById("diffuseG").value),
                parseFloat(document.getElementById("diffuseB").value)
            );
        }
        gl.uniform1f(materialShininessUniform, parseFloat(document.getElementById("shininess").value));

}

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

    var normalMatrix = mat3();
    toInverseMat3(mvMatrix, normalMatrix);
    normalMatrix = transpose(normalMatrix);
    gl.uniformMatrix3fv(uNMatrix, false, flatten(normalMatrix) );     

    //Map

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    let vertexPos = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPos);

    gl.bindBuffer( gl.ARRAY_BUFFER, textBuffer );
    let vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    let aVertexNormal = gl.getAttribLocation( program, "aVertexNormal" );
    gl.vertexAttribPointer( aVertexNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aVertexNormal );
    
    
    setUniforms();


    //carreguem textures
    gl.uniform1i(textureUniform, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, galvanizedTexture);
    gl.uniform1i(uniformUseTextureBoolean, 1);

   
    gl.drawArrays( gl.TRIANGLES, 0, numVertex1 );

    //drawing the 3d obejcts
    for(var i=0;i<objects3d.length;i++){
        gl.uniform1i(uniformUseTextureBoolean, 0); //no volem textures en els cosos 3d d'aquí        
        objects3d[i].draw();
    }
        

    animate();


    requestAnimFrame( render );
}
