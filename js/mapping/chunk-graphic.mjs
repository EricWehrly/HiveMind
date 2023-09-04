import Events from '../events.mjs';
import Renderer from '../rendering/renderer.mjs';
import Map from './map.mjs';

// TODO: This playfield reference should probably be stored somewhere more globally referencable
let playfield = null;

function createGraphic(chunk) {

    chunk.graphic = document.createElement('div');
    chunk.graphic.className = 'chunk';
    if (chunk.color) chunk.graphic.className += ` ${chunk.color}`;

    if(playfield == null) playfield = document.getElementById("playfield");
    playfield.appendChild(chunk.graphic);
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

Events.Subscribe(Events.List.GameStart, function() {

    Events.Subscribe(Events.List.ChunkCreated, createGraphic);
});

Renderer.RegisterRenderMethod(10, redraw_loop);
