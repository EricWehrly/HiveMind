import Rectangle from '../../baseTypes/rectangle';
import Events from '../../events';
import Chunk, { ChunkEvent } from '../../mapping/chunk';
import GameMap from '../../mapping/GameMap';
import DomRenderingContext from '../contexts/DomRenderingContext';
import Renderer from '../renderer';

const chunkGraphics: WeakMap<Chunk, HTMLElement> = new WeakMap();

function createGraphic(chunk: Chunk, domRoot: HTMLElement) {

    const graphic = document.createElement('div');
    chunkGraphics.set(chunk, graphic);

    graphic.className = 'chunk';
    // if (chunk.color) graphic.className += ` ${chunk.color}`;

    domRoot.appendChild(graphic);

    const chunkPixels = Chunk.CHUNK_SIZE * Renderer.GRID_SIZE;
    graphic.style.width = chunkPixels + "px";
    graphic.style.height = chunkPixels + "px";

    // border color from biome?
}

function redraw(chunk: Chunk, screenRect: Rectangle, domRoot: HTMLElement) {

    if(!chunkGraphics.has(chunk)) createGraphic(chunk, domRoot);

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

    const graphic = chunkGraphics.get(chunk);
    const gridSize = Renderer.GRID_SIZE;

    const offsetPosition = {
        x: (chunk.x * gridSize) - screenRect.x,
        y: (chunk.y * gridSize) - screenRect.y
    };

    graphic.style.left = (gridSize * offsetPosition.x) + "px";
    graphic.style.top = (gridSize * offsetPosition.y) + "px";
}

function onChunkActiveChanged(event: ChunkEvent) {
    
    if(event.chunk.active == false)  {
        const graphic = chunkGraphics.get(event.chunk);
        
        if (graphic) {
            graphic.parentNode.removeChild(graphic);
            chunkGraphics.delete(event.chunk);
        }
    }
}

Events.Subscribe(Events.List.ChunkActiveChanged, onChunkActiveChanged);

function redraw_loop(screenRect: Rectangle, domRoot: HTMLElement) {

    for(var chunk of Object.values(GameMap.Instance.chunks)) {
        // if chunk in screenRect
        redraw(chunk, screenRect, domRoot);
    }
}

DomRenderingContext.RegisterRenderMethod(10, redraw_loop);
