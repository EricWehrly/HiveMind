import Events from "../events";
import Map from './map';
import Seed from "../core/seed.mjs";
import './chunk-graphic.mjs';
import Biome from "./biome";
import Point from "../coordinates/point";

Events.List.ChunkCreated = "ChunkCreated";

interface ChunkOptions {
    biome: Biome;
    x: number;
    y: number;
    active: boolean;
    map: Map;
}

export default class Chunk {

    static CHUNK_SIZE = 25;
    static get MIN_FERTILITY() { return 1; }
    static get MAX_FERTILITY() { return 100; }
    static get MIN_DANGER() { return 1; }
    static get MAX_DANGER() { return 100; }

    static getChunkCoordinate(worldCoordinate: Point): Point {

        let { x, y } = worldCoordinate;

        let chunkX = 0;
        let chunkY = 0;
        // if x (or y) less than 0
        if(x < 0) {
            chunkX = -1;
            while(x <= -1 * this.CHUNK_SIZE) {
                chunkX--;
                x += this.CHUNK_SIZE;
            }
        } else {
            while(x >= this.CHUNK_SIZE) {
                chunkX++;
                x -= this.CHUNK_SIZE;
            }
        }

        if(y < 0) {
            chunkY = -1;
            while(y <= -1 * this.CHUNK_SIZE) {
    
                chunkY--;
                y += this.CHUNK_SIZE;
            }
        } else {
            while(y >= this.CHUNK_SIZE) {
    
                chunkY++;
                y -= this.CHUNK_SIZE;
            }
        }

        return new Point(
            chunkX,
            chunkY
        );
    }

    get coordinate() {
        // TODO: This now needs to align with Point.toString and that sucks
        return this.x + ", " + this.y;
    }

    #biome
    private _seed
    get seed() {
        return this._seed;
    }
    private _danger
    get danger() {
        return this._danger;
    }
    private _hostility
    get hostility() {
        return this._hostility;
    }
    private _flora
    get flora() {
        return this._flora;
    }

    // TODO: remove reundant
    get Seed() {
        return this._seed;
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

    constructor(options: ChunkOptions) {

        if(!options.biome) debugger;

        this.#biome = options.biome;
        if(options.x) this.#x = options.x;
        if(options.y) this.#y = options.y;
        if(options.active) this.active = options.active;
        this._seed = new Seed(Map.Instance.Seed.Random());
        const seed = this._seed;

        this.#distance = Math.abs(this.#x) + Math.abs(this.#y);
        this._danger = seed.Random(Math.max(this.#distance - 1, 0), this.#distance + 1) + 1;
        this._hostility = seed.Random(1, this._danger);
        // TODO: base this off adjacent flora value (like be +- that value), not totally random
        this._flora = seed.Random(1, 10);

        options.map.addChunk(this);
        Events.RaiseEvent(Events.List.ChunkCreated, this, {
            isNetworkBoundEvent: true
        });
        // console.log(`New chunk at ${options.x}, ${options.y}`);
    }

    equals(chunk: Chunk) {

        if(!(chunk instanceof Chunk)) return false;

        return chunk.x == this.x
            && chunk.y == this.y;
    }
}
