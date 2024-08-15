import Rectangle from '../baseTypes/rectangle';
import Renderer from '../rendering/renderer';
import Chunk from './chunk';
import Map from './map';

// TODO: This playfield reference should probably be stored somewhere more globally referencable
let playfield: Element = null;

// TODO: make this a global enum
const gridSize = 32;

const chunkGraphics: WeakMap<Chunk, HTMLElement> = new WeakMap();

function createGraphic(chunk: Chunk) {

    const graphic = document.createElement('div');
    chunkGraphics.set(chunk, graphic);

    graphic.className = 'chunk';
    // if (chunk.color) graphic.className += ` ${chunk.color}`;

    if(playfield == null) playfield = document.getElementById("playfield");
    playfield.appendChild(graphic);

    const chunkPixels = Chunk.CHUNK_SIZE * gridSize;
    graphic.style.width = chunkPixels + "px";
    graphic.style.height = chunkPixels + "px";

    // border color from biome?
}

function redraw(chunk: Chunk, screenRect: Rectangle) {

    if(!chunkGraphics.has(chunk)) createGraphic(chunk);

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

    const graphic = chunkGraphics.get(chunk);
    // TODO: get grid size constant
    const gridSize = 32;

    const offsetPosition = {
        x: (chunk.x * gridSize) - screenRect.x,
        y: (chunk.y * gridSize) - screenRect.y
    };

    graphic.style.left = (gridSize * offsetPosition.x) + "px";
    graphic.style.top = (gridSize * offsetPosition.y) + "px";
}

function redraw_loop(screenRect: Rectangle) {

    for(var chunk of Object.values(Map.Instance.chunks)) {
        // if chunk in screenRect
        redraw(chunk, screenRect);
    }
}

Renderer.RegisterRenderMethod(10, redraw_loop);
