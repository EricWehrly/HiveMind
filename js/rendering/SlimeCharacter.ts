import { CharacterUtils } from "../../engine/js/entities/character/CharacterUtils";
import Entity from "../../engine/js/entities/character/Entity";
import { FLAG_SKIP_DOM_RENDERING, RemoveEntityGraphic } from "../../engine/js/rendering/entities/entity-graphics";
import WebGLRenderer from "../../engine/js/rendering/contexts/WebGLRenderer";

import vertexShaderSource from './SlimeVertex.glsl';
import fragmentShaderSource from './SlimeFragment.glsl';

let localPlayer: Entity;

let shaderProgram: WebGLProgram;

function redraw_loop(context: WebGL2RenderingContext) {
    if(!context) {
        return;
    }

    if(!localPlayer) {
        onGameStart(context);
        return;
    };


    const cubeVertices = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // ... define the rest of the cube vertices here
    ];

    const cubeVertexBuffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, cubeVertexBuffer);
    context.bufferData(context.ARRAY_BUFFER, new Float32Array(cubeVertices), context.STATIC_DRAW);

    const positionAttributeLocation = context.getAttribLocation(shaderProgram, 'aVertexPosition');
    context.enableVertexAttribArray(positionAttributeLocation);
    context.vertexAttribPointer(positionAttributeLocation, 3, context.FLOAT, false, 0, 0);

    context.useProgram(shaderProgram);
    context.drawArrays(context.TRIANGLES, 0, cubeVertices.length / 3);

}

function onGameStart(context: WebGL2RenderingContext) {
    localPlayer = CharacterUtils.GetLocalPlayer();
    if(localPlayer) {
        RemoveEntityGraphic(localPlayer);
        localPlayer.addFlag(FLAG_SKIP_DOM_RENDERING);

        shaderProgram = initShaderProgram(context, vertexShaderSource, fragmentShaderSource);
    }
}

function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
  
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      return null;
    }
  
    return shaderProgram;
  }

  function loadShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
  
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
  }

  WebGLRenderer.RegisterRenderMethod(10, redraw_loop);
