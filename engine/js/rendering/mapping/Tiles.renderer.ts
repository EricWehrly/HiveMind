import Camera from "../../camera";
import Chunk from "../../mapping/chunk";

export function RenderChunkTiles(context: CanvasRenderingContext2D, chunk: Chunk) {

    const camera = Camera.get();
    const startCoords = camera.GameToScreenCoords(chunk.position);

    for(var tile of chunk.tiles) {
        context.lineWidth = 1;
        context.strokeStyle = "green";
        // offset by chunk position
        context.strokeRect(
            // TODO: retrieve '32'
            startCoords.x + (tile.x * 32),
            startCoords.y + (tile.y * 32),
            32,
            32
        );
        context.fillStyle = "black";
        context.font = "10px Arial";
        // can we do this only if the mouse is over the tile?
        context.fillText(
            `${tile.x},${tile.y},${tile.z}`,
            startCoords.x + (tile.x * 32) + 4, 
            startCoords.y + (tile.y * 32) + 10);
    }
}
