import Rectangle from "../../baseTypes/rectangle";
import Camera from "../../camera";
import Events from "../../events";
import Chunk, { ChunkEvent } from "../../mapping/chunk";
import GameMap from "../../mapping/GameMap";
import ThreeJSRenderContext from "../contexts/ThreeJS.RenderContext";
import Renderer from "../renderer";
import * as THREE from 'three';

function onChunkCreated(event: ChunkEvent) {
    const chunk = event.chunk;
    const chunkSize = Chunk.CHUNK_SIZE;
    const tileSize = Renderer.GRID_SIZE;

    let colorNumber = 100;
    for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize; y++) {
            const color = '#ffa' + (colorNumber++).toString();
            const tile = chunk.getTile(x, y);
            
            const geometry = new THREE.PlaneGeometry(tileSize, tileSize, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(geometry, material);

            // Adjust the z-values of the vertices
            const vertices = geometry.attributes.position.array;
            const zValue = tile.z;
            const adjacentZValues = [
                chunk.getTile(x - 1, y)?.z || zValue,
                chunk.getTile(x + 1, y)?.z || zValue,
                chunk.getTile(x, y - 1)?.z || zValue,
                chunk.getTile(x, y + 1)?.z || zValue
            ];
            const averageZ = (zValue + adjacentZValues.reduce((a, b) => a + b, 0)) / (adjacentZValues.length + 1);

            vertices[2] = averageZ; // top-left vertex
            vertices[5] = averageZ; // top-right vertex
            vertices[8] = averageZ; // bottom-left vertex
            vertices[11] = averageZ; // bottom-right vertex

            geometry.attributes.position.needsUpdate = true;

            mesh.position.set(x * tileSize, y * tileSize, 0);
            ThreeJSRenderContext.Instance.scene.add(mesh);

            // ThreeJSRenderContext.Instance.camera.lookAt(mesh.position);
        }
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
        Chunk.CHUNK_SIZE * Renderer.GRID_SIZE,
        Chunk.CHUNK_SIZE * Renderer.GRID_SIZE);
    // context.fillText(`${chunk.x}, ${chunk.y}`, startCoords.x + 10, startCoords.y + 20);
    // RenderChunkTiles(context, chunk);
}

function redraw_loop(context: CanvasRenderingContext2D): void {

    const screenRect = Camera.get().screenRect;

    for(var chunk of Object.values(GameMap.Instance.chunks)) {
        // TODO: instead of doing this,
        // (for performance reasons)
        /// it WILL be fewer computes to just track when the screenRect changes and calculate this then

        if(screenRect.contains(chunk.area)) {
            draw(context, chunk, screenRect);
        }
    }
}

Events.Subscribe(Events.List.ChunkCreated, onChunkCreated);
