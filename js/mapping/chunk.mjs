import Events from "../events.mjs";
import Map from '../mapping/map.mjs';
import Game from "../engine.mjs";
import Seed from "../core/seed.mjs";

Events.List.ChunkCreated = "ChunkCreated";

export default class Chunk {

    static CHUNK_SIZE = 25;

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

    #seed
    get seed() {
        return this.#seed;
    }
    #danger
    get danger() {
        return this.#danger;
    }
    #hostility
    get hostility() {
        return this.#hostility;
    }
    #flora
    get flora() {
        return this.#flora;
    }

    get Seed() {
        return this.#seed;
    }

    constructor(options) {
        if(options.x) this.x = options.x;
        if(options.y) this.y = options.y;
        this.#seed = new Seed(Game.Seed.Random());
        const seed = this.#seed;

        const distance = Math.abs(this.x) + Math.abs(this.y);
        this.#danger = seed.Random(Math.max(distance - 1, 0), distance + 1) + 1;
        this.#hostility = seed.Random(1, this.#danger * 3);
        // TODO: base this off adjacent flora value (like be +- that value), not totally random
        this.#flora = seed.Random(1, 10);

        console.log(this);
        Map.Map.addChunk(this);
        Events.RaiseEvent(Events.List.ChunkCreated, this, {
            isNetworkBoundEvent: true
        });
        // console.log(`New chunk at ${options.x}, ${options.y}`);
        // TODO: Biomes. Like, you can have data-driven biome selection for chunks ..
    }

    x = 0;
    y = 0;
}
