"use strict";
class ObjFileObject{
    constructor(gl, program, fileName, texture){
        this.gl = gl;
        this.program = program;
        this.nBuffer = undefined;
        this.cBuffer = undefined;
        this.vBuffer = undefined;
        this.tBuffer = undefined;
        this.iBuffer = undefined;
        this.nVertex = 0;
        this.nItems = 0;
        this.scaleMatrix = mat4();
        this.translationMatrix = mat4();
        this.rotationMatrix = mat4();
        this.color = vec4( 0.0, 0.0, 0.0, 1.0 );
        this.texture = texture;
        this.loadObject(fileName);
        this.vertexPos = gl.getAttribLocation(this.program, "vPosition");
        this.vertexTexture = gl.getAttribLocation( this.program, "vTexCoord" );
        // this.vertexColor = gl.getAttribLocation( this.program, "vColor" );
        this.aVertexNormal = gl.getAttribLocation( this.program, "aVertexNormal" );

        gl.enableVertexAttribArray(this.vertexPos);
        gl.enableVertexAttribArray(this.vertexTexture);
        // gl.enableVertexAttribArray(this.vertexColor); 
        gl.enableVertexAttribArray(this.aVertexNormal); 
    }

    handleLoadedObject(fileData) {

        var colors= [];
        
        for(var i = 0; i<fileData.vertexPositions/3; i++) colors.push(this.color);

    
        this.cBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );


        this.nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fileData.vertexNormals), gl.STATIC_DRAW);
        this.nBuffer.numItems = fileData.vertexNormals.length / 3;

        this.tBuffer  = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fileData.vertexTextureCoords), gl.STATIC_DRAW);
        this.tBuffer.numItems = fileData.vertexTextureCoords.length / 2;

        this.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fileData.vertexPositions), gl.STATIC_DRAW);
        this.vBuffer.numItems = fileData.vertexPositions.length / 3;
        this.nVertex = fileData.vertexPositions.length/3;

        this.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fileData.indices), gl.STATIC_DRAW);
        this.nItems = fileData.indices.length;
    }


    loadObject(fileName) {
        var request = new XMLHttpRequest();
        var that = this;
        request.open("GET", fileName);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                that.handleLoadedObject(JSON.parse(request.responseText));
            }
        }
        request.send();
    }

    setScale(x, y, z){
        this.scaleMatrix = scalem(x,y,z);
    }

    addScalanation(x,y,z){
        this.scaleMatrix = mult(this.scaleMatrix, scalem(x,y,z));
    }

    setTranslation(x,y,z){
        this.translationMatrix = translate(x,y,z);
    }

    addRotation(angle, axis){ //adds a rotation effect to the object, rep angle i vector de 3 amb els eixos de rotació
        this.rotationMatrix = mult(this.rotationMatrix, rotate(angle,axis));   
    }

    addTranslation(x,y,z){
        this.translationMatrix = mult(this.translationMatrix, translate(x,y,z));
    }


    draw(){
        if( this.iBuffer== undefined ||  this.iBuffer== undefined ||  this.iBuffer== undefined||  this.iBuffer == undefined){
            return
        }
        let movement = mult(this.rotationMatrix, this.translationMatrix);
        let transformation = mult(movement, this.scaleMatrix);

        let uniformLoc = gl.getUniformLocation(this.program, "objectTransformation");
        gl.uniformMatrix4fv(uniformLoc, false, flatten(transformation) ); 

        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.vertexAttribPointer(this.vertexPos, 3, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer  );
        gl.vertexAttribPointer(this.vertexTexture, 2, gl.FLOAT, false, 0, 0 ); 

        // gl.bindBuffer( gl.ARRAY_BUFFER, this.cBuffer  );
        // gl.vertexAttribPointer(this.vertexColor, 4, gl.FLOAT, false, 0, 0 );

        gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
        gl.vertexAttribPointer(this.aVertexNormal , 3, gl.FLOAT, false, 0, 0);

        let useTexUniform = gl.getUniformLocation(this.program, "useTexture");
        gl.uniform1i(useTexUniform, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        let textureUniform = gl.getUniformLocation(this.program, "texture");
        gl.uniform1i(textureUniform, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);

        gl.drawElements(gl.TRIANGLES, this.nItems, gl.UNSIGNED_SHORT, 0);

    }

}