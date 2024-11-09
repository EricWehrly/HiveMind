import Rectangle from "../../baseTypes/rectangle";
import Camera from "../../camera";
import Chunk from "../../mapping/chunk";
import Renderer from "../renderer";

export function RenderChunkTiles(context: CanvasRenderingContext2D, chunk: Chunk) {

    const camera = Camera.get();
    const startCoords = camera.GameToScreenCoords(chunk.position);
    const gridSize = Renderer.GRID_SIZE;

    for(var tile of chunk.tiles) {
        context.lineWidth = 1;
        context.strokeStyle = "green";
        // offset by chunk position
        context.strokeRect(
            startCoords.x + (tile.x * gridSize),
            startCoords.y + (tile.y * gridSize),
            gridSize,
            gridSize
        );

        const rect = new Rectangle(
            startCoords.x + (tile.x * gridSize), 
            startCoords.y + (tile.y * gridSize),
            gridSize, gridSize);
        const mouse = Renderer.MouseScreenPos;
        if(mouse && rect && rect.containsPoint(mouse.x, mouse.y)) {
            context.fillStyle = "black";
            context.font = "12px Arial";
            context.fillText(
                `${tile.x},${tile.y}`,
                rect.x + 4, 
                rect.y + 14);
        }
    }
}
