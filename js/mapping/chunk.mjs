import Events from "../events.mjs";
import Map from '../mapping/map.mjs';
import Seed from "../core/seed.mjs";
import './chunk-graphic.mjs';

Events.List.ChunkCreated = "ChunkCreated";

export default class Chunk {

    static CHUNK_SIZE = 25;
    static get MIN_FERTILITY() { return 1; }
    static get MAX_FERTILITY() { return 100; }
    static get MIN_DANGER() { return 1; }
    static get MAX_DANGER() { return 100; }

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

    #biome
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

    #x = 0
    #y = 0
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }

    #active = false;
    get active() {
        return this.#active;
    }
    set active(value) {
        if(value == this.#active) return;
        // TODO: one last check to prevent deactivating a chunk that a player is in
        // if(value == false) console.log(`Deactivating chunk at ${this.coordinate}`);
        // else console.log(`Activating chunk at ${this.coordinate}`);
        this.#active = value;
    }

    #distance;
    get distance() { return this.#distance; }

    constructor(options) {

        if(!options.biome) debugger;

        this.#biome = options.biome;
        if(options.x) this.#x = options.x;
        if(options.y) this.#y = options.y;
        if(options.active) this.active = options.active;
        this.#seed = new Seed(Map.Map.Seed.Random());
        const seed = this.#seed;

        this.#distance = Math.abs(this.#x) + Math.abs(this.#y);
        this.#danger = seed.Random(Math.max(this.#distance - 1, 0), this.#distance + 1) + 1;
        this.#hostility = seed.Random(1, this.#danger);
        // TODO: base this off adjacent flora value (like be +- that value), not totally random
        this.#flora = seed.Random(1, 10);

        console.log(this);
        Map.Map.addChunk(this);
        Events.RaiseEvent(Events.List.ChunkCreated, this, {
            isNetworkBoundEvent: true
        });
        // console.log(`New chunk at ${options.x}, ${options.y}`);
    }

    equals(chunk) {

        if(!(chunk instanceof Chunk)) return false;

        return chunk.x == this.x
            && chunk.y == this.y;
    }
}
