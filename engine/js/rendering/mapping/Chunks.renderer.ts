import Events from "../../events";
import Chunk, { ChunkEvent } from "../../mapping/chunk";
import ThreeJSRenderContext from "../contexts/ThreeJS.RenderContext";
import Renderer from "../renderer";
import * as THREE from 'three';

function onChunkCreated(event: ChunkEvent) {
    const chunk = event.chunk;
    const chunkSize = Chunk.CHUNK_SIZE;
    const tileSize = Renderer.GRID_SIZE;

    const vertices = [];
    const indices = [];
    const colors = [];

    let colorNumber = 100;
    for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize; y++) {
            const color = new THREE.Color('#ffa' + (colorNumber++).toString());
            const tile = chunk.getTile(x, y);

            const zValue = tile.z;
            const adjacentZValues = [
                chunk.getTile(x - 1, y)?.z || zValue,
                chunk.getTile(x + 1, y)?.z || zValue,
                chunk.getTile(x, y - 1)?.z || zValue,
                chunk.getTile(x, y + 1)?.z || zValue
            ];
            let averageZ = (zValue + adjacentZValues.reduce((a, b) => a + b, 0)) / (adjacentZValues.length + 1);
            averageZ = averageZ * 10;

            const baseIndex = vertices.length / 3;

            // Define the four vertices of the tile
            vertices.push(x * tileSize, y * tileSize, averageZ); // top-left
            vertices.push((x + 1) * tileSize, y * tileSize, averageZ); // top-right
            vertices.push(x * tileSize, (y + 1) * tileSize, averageZ); // bottom-left
            vertices.push((x + 1) * tileSize, (y + 1) * tileSize, averageZ); // bottom-right

            // Define the two faces of the tile (two triangles)
            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
            indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);

            // Define the color for each vertex
            for (let i = 0; i < 4; i++) {
                colors.push(color.r, color.g, color.b);
            }
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);

    ThreeJSRenderContext.Instance.scene.add(mesh);
}

Events.Subscribe(Events.List.ChunkCreated, onChunkCreated);
