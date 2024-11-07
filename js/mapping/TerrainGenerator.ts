import Seed from "../core/seed";
import GameMap from "./GameMap";
import Chunk from "./chunk";
import Tile from "./tile";

export interface TerrainGenerationOptions {
    seed: Seed;
    fertility?: number; // defaults to 1 if null
    danger?: number; // defaults to 1 if null
    tiles?: Tile[]; // existing (adjacent) tiles to help inform generation
}

export default class TerrainGenerator {
    
    // no instances
    private constructor() {}

    static Generate(options: TerrainGenerationOptions): Tile[] {

        const tiles: Tile[] = [];
        
        // for now
        const chunkTilesPerSide = Chunk.CHUNK_SIZE;

        // prolly want 300 once we start 'walking it down'
        const mountainPeakDistance = 10;   // tiles

        // pick a spot for mountain
        // put mountain

        for(let x = 0; x < chunkTilesPerSide; x++) {
            for(let y = 0; y < chunkTilesPerSide; y++) {
                const tile = new Tile(x, y, 0);
                tile.x = x;
                tile.y = y;
                tiles.push(tile);
            }
        }

        return tiles;
    }

    private static generateMountain(map: GameMap, distance: number) {

        const xDist = map.Seed.Random(0, distance);
        const yDist = distance - xDist;
        
        // const mountainPeak = map.
    }
}