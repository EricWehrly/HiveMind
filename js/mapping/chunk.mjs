import Events from "../events.mjs";
import Map from '../mapping/map.mjs';

Events.List.ChunkCreated = "ChunkCreated";

export default class Chunk {

    static CHUNK_SIZE = 25;

    static {
        // TODO: Listen for (NETWORK ONLY) chunk create event
        // if it's in conflict with a chunk we have, raise an alarm
        // otherwise, add to the current(?) map
        // actually, probably put this in the map class ...
        // Events.RaiseEvent(Events.List.ChunkCreated, this, false, false);
    }

    static getChunkCoordinate(x, y) {

        let chunkX = 0;
        let chunkY = 0;
        while(x >= this.CHUNK_SIZE) {
            chunkX++;
            x -= this.CHUNK_SIZE;
        }
        while(y >= this.CHUNK_SIZE) {

            chunkY++;
            y -= this.CHUNK_SIZE;
        }

        return {
            x: chunkX,
            y: chunkY
        }
    }

    get coordinate() {
        return this.x + "," + this.y;
    }

    constructor(options) {
        if(options.x) this.x = options.x;
        if(options.y) this.y = options.y;

        Map.Map.addChunk(this);
        Events.RaiseEvent(Events.List.ChunkCreated, this, false, false);
        console.log(`New chunk at ${options.x}, ${options.y}`);
        // TODO: Biomes. Like, you can have data-driven biome selection for chunks ..
    }

    x = 0;
    y = 0;
}
