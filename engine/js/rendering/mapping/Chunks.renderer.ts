import Events from "../../events";
import Chunk, { ChunkEvent } from "../../mapping/chunk";
import ThreeJSRenderContext from "../contexts/ThreeJS.RenderContext";
import Renderer from "../renderer";
import * as THREE from 'three';
function onChunkCreated(event: ChunkEvent) {
    const chunk = event.chunk;
    const chunkSize = Chunk.CHUNK_SIZE;
    const tileSize = Renderer.GRID_SIZE;
    
    const vertices: number[] = [];
    const indices: number[] = [];
    const colors: number[] = [];

    const xOffset = chunk.x * chunkSize * tileSize;
    const yOffset = chunk.y * chunkSize * tileSize;

    let colorNumber = 100;
    for (let x = 0; x < chunkSize; x++) {
        for (let y = 0; y < chunkSize; y++) {
            colorNumber = addTile(colorNumber, chunk, x, y, vertices, tileSize, indices, chunkSize, colors);
        }
    }

    const mesh = createMesh(vertices, colors, indices, xOffset, yOffset);

    ThreeJSRenderContext.Instance.scene.add(mesh);
}

Events.Subscribe(Events.List.ChunkCreated, onChunkCreated);

function addTile(colorNumber: number, chunk: Chunk, x: number, y: number, vertices: any[], tileSize: number, indices: any[], chunkSize: number, colors: any[]) {
    const color = new THREE.Color('#ffa' + (colorNumber++).toString());
    const edgeColor = new THREE.Color('#ff0000'); // Special color for edge vertices
    const tile = chunk.getTile(x, y);

    const zValue = tile.z;
    const adjacentZValues = [
        chunk.getTile(x - 1, y)?.z || zValue,
        chunk.getTile(x + 1, y)?.z || zValue,
        chunk.getTile(x, y - 1)?.z || zValue,
        chunk.getTile(x, y + 1)?.z || zValue
    ];
    const averageZ = (zValue + adjacentZValues.reduce((a, b) => a + b, 0)) / (adjacentZValues.length + 1);

    const baseIndex = vertices.length / 3;

    // Define the four vertices of the tile
    vertices.push(x * tileSize, averageZ, y * tileSize); // top-left
    vertices.push((x + 1) * tileSize, averageZ, y * tileSize); // top-right
    vertices.push(x * tileSize, averageZ, (y + 1) * tileSize); // bottom-left
    vertices.push((x + 1) * tileSize, averageZ, (y + 1) * tileSize); // bottom-right


    // Define the two faces of the tile (two triangles)
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
    indices.push(baseIndex + 1, baseIndex + 3, baseIndex + 2);

    // Define the color for each vertex
    for (let i = 0; i < 4; i++) {
        // Check if the vertex is at the edge of the chunk
        const isEdge = x === 0 || x === chunkSize - 1 || y === 0 || y === chunkSize - 1;
        const vertexColor = isEdge ? edgeColor : color;
        colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }
    return colorNumber;
}

function createMesh(vertices: number[], colors: number[], indices: number[], xOffset: number, yOffset: number) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(xOffset, 0, yOffset);
    return mesh;
}

