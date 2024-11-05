import Events, { GameEvent } from "../events";
import GameMap from './GameMap';
import Seed from "../core/seed";
import Biome from "./biome";
import Point from "../coordinates/point";
import { Defer } from "../Loop";
import Rectangle from "../baseTypes/rectangle";
import WorldCoordinate from "../coordinates/WorldCoordinate";

Events.List.ChunkCreated = "ChunkCreated";
Events.List.ChunkActiveChanged = "ChunkActiveChanged";

export interface ChunkEvent extends GameEvent {
    chunk: Chunk;
}

export interface ChunkOptions {
    biome: Biome;
    x: number;
    y: number;
    active: boolean;
    gameMap: GameMap;
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
        if(x < 0) {
            while(x <= -1 * this.CHUNK_SIZE) {
                chunkX--;
                x += this.CHUNK_SIZE;
            }
            if(x < 0) chunkX--;
        } else {
            while(x >= this.CHUNK_SIZE) {
                chunkX++;
                x -= this.CHUNK_SIZE;
            }
        }

        if(y < 0) {
            while(y <= -1 * this.CHUNK_SIZE) {
    
                chunkY--;
                y += this.CHUNK_SIZE;
            }
            if(y < 0) chunkY--;
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

    static getWorldCoordinate(chunkCoordinate: Point): Point {
        let { x, y } = chunkCoordinate;
        return new Point(x * this.CHUNK_SIZE, y * this.CHUNK_SIZE);
    }

    get coordinate() {
        // TODO: This now needs to align with Point.toString and that sucks
        return this.x + ", " + this.y;
    }

    _biome: Biome;
    get biome() { return this._biome; }
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
    private _map;
    get map() { return this._map; }

    // TODO: remove reundant
    get Seed() {
        return this._seed;
    }

    // chunk coords
    #x = 0
    #y = 0
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }

    // game units...
    private _position: Readonly<WorldCoordinate>;
    private _area: Rectangle;
    get position() { return this._position; }
    get area() { return this._area; }

    #active = false;
    get active() {
        return this.#active;
    }
    set active(value) {
        if(value == this.#active) return;
        // console.log(`setting chunk to ${value == true ? "active" : "inactive" }`, this);
        // TODO: one last check to prevent deactivating a chunk that a player is in
        // if(value == false) console.log(`Deactivating chunk at ${this.coordinate}`);
        // else console.log(`Activating chunk at ${this.coordinate}`);
        this.#active = value;

        const chunkEvent: ChunkEvent = {
            chunk: this
        };
        Events.RaiseEvent(Events.List.ChunkActiveChanged, chunkEvent);
    }

    #distance;
    get distance() { return this.#distance; }

    constructor(options: ChunkOptions) {

        if(!options.biome) debugger;

        this._biome = options.biome;
        if(options.x) this.#x = options.x;
        if(options.y) this.#y = options.y;
        if(options.active) this.active = options.active;
        this._seed = new Seed(options.gameMap.Seed.Random());
        const seed = this._seed;

        // values for world generation
        this.#distance = Math.abs(this.#x) + Math.abs(this.#y);
        this._danger = seed.Random(Math.max(this.#distance - 1, 0), this.#distance + 1) + 1;
        this._hostility = seed.Random(1, this._danger);
        // TODO: base this off adjacent flora value (like be +- that value), not totally random
        this._flora = seed.Random(1, 10);

        this._map = options.gameMap;
        this.map.AddChunk(this);
        // game units
        const thisWorldPos = Chunk.getWorldCoordinate(new Point(this.#x, this.#y));
        this._position = new WorldCoordinate(thisWorldPos.x, thisWorldPos.y);
        this._area = new Rectangle(this.#x, this.#y, Chunk.CHUNK_SIZE, Chunk.CHUNK_SIZE);

        const createdEvent: ChunkEvent = {
            chunk: this
        };
        const eventOptions = {
            isNetworkBoundEvent: true
        }
        Defer(() => {
            Events.RaiseEvent(Events.List.ChunkCreated, createdEvent, eventOptions);
        });
        // console.log(`New chunk at ${options.x}, ${options.y}`);
    }

    equals(chunk: Chunk) {

        if(!(chunk instanceof Chunk)) return false;

        return chunk.x == this.x
            && chunk.y == this.y;
    }
}
