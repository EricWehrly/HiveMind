import Rectangle from "../../baseTypes/rectangle";
import Camera from "../../camera";
import Events from "../../events";
import Chunk, { ChunkEvent } from "../../mapping/chunk";
import GameMap from "../../mapping/GameMap";
import CanvasRenderingContext from "../contexts/CanvasRenderingContext";

function onChunkActiveChanged(event: ChunkEvent) {
    
    if(event.chunk.active == false)  {
    }
}

function draw(context: CanvasRenderingContext2D, chunk: Chunk, screenRect: Rectangle) {
    const camera = Camera.get();

    const startCoords = camera.GameToScreenCoords(chunk.position);
    
    context.lineWidth = 1;
    context.strokeStyle = "yellow";
    context.strokeRect(
        startCoords.x,
        startCoords.y,
        Chunk.CHUNK_SIZE * 32,  // TODO: pull the '32' from grid_size ... wherever it went
        Chunk.CHUNK_SIZE * 32);  // TODO: pull the '32' from grid_size ... wherever it went
}

function redraw_loop(context: CanvasRenderingContext2D): void {

    const screenRect = Camera.get().screenRect;

    for(var chunk of Object.values(GameMap.Instance.chunks)) {
        // TODO: instead of doing this,
        // (for performance reasons)
        /// it WILL be fewer computes to just track when the screenRect changes and calculate this then


        // these seem to stop rendering as the player crosses certain world areas...
        if(screenRect.contains(chunk.area)) {
            draw(context, chunk, screenRect);
        }
    }
}

CanvasRenderingContext.RegisterRenderMethod(10, redraw_loop);

Events.Subscribe(Events.List.ChunkActiveChanged, onChunkActiveChanged);