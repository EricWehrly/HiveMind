import Renderer from '../rendering/renderer.mjs';
import Chunk from './chunk.ts';
import Map from './map.ts';

// TODO: This playfield reference should probably be stored somewhere more globally referencable
let playfield = null;

// TODO: make this a global enum
const gridSize = 32;

function createGraphic(chunk) {

    chunk.graphic = document.createElement('div');
    chunk.graphic.className = 'chunk';
    if (chunk.color) chunk.graphic.className += ` ${chunk.color}`;

    if(playfield == null) playfield = document.getElementById("playfield");
    playfield.appendChild(chunk.graphic);

    const chunkPixels = Chunk.CHUNK_SIZE * gridSize;
    chunk.graphic.style.width = chunkPixels + "px";
    chunk.graphic.style.height = chunkPixels + "px";

    // border color from biome?
}

function redraw(chunk, screenRect) {

    if(!chunk.graphic) createGraphic(chunk);

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

    // TODO: get grid size constant
    const gridSize = 32;

    const offsetPosition = {
        x: (chunk.x * gridSize) - screenRect.x,
        y: (chunk.y * gridSize) - screenRect.y
    };

    chunk.graphic.style.left = (gridSize * offsetPosition.x) + "px";
    chunk.graphic.style.top = (gridSize * offsetPosition.y) + "px";
}

function redraw_loop(screenRect) {

    for(var chunk of Object.values(Map.Map.chunks)) {
        // if chunk in screenRect
        redraw(chunk, screenRect);
    }
}

Renderer.RegisterRenderMethod(10, redraw_loop);
