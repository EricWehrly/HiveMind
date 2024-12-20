import Events, { GameEvent } from "../events";
import GameMap from './GameMap';
import Seed from "../core/seed";
import Biome from "./biome";
import Point from "../coordinates/point";
import { Defer } from "../Loop";
import Rectangle from "../baseTypes/rectangle";
import WorldCoordinate from "../coordinates/WorldCoordinate";
import Tile from "./tile";

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
    tiles: Tile[];
}

export default class Chunk {

    static CHUNK_SIZE = 25;
    static get MIN_FERTILITY() { return 1; }
    static get MAX_FERTILITY() { return 100; }
    static get MIN_DANGER() { return 1; }
    static get MAX_DANGER() { return 100; }

    static getChunkCoordinate(worldCoordinate: Point): Point {
    
        let chunkX = Math.floor(worldCoordinate.x / this.CHUNK_SIZE);
        let chunkY = Math.floor(worldCoordinate.y / this.CHUNK_SIZE);
    
        return new Point(chunkX, chunkY);
    }

    static getWorldCoordinate(chunkCoordinate: Point): Point {
        let { x, y } = chunkCoordinate;
        return new Point(x * this.CHUNK_SIZE, y * this.CHUNK_SIZE);
    }

    get coordinate() {
        // TODO: This now needs to align with Point.toString and that sucks
        return this.x + ", " + this.y;
    }

    private _biome: Biome;
    get biome() { return this._biome; }
    private _seed;
    get seed() { return this._seed; }
    private _danger;
    get danger() { return this._danger; }
    private _hostility;
    get hostility() { return this._hostility; }
    private _flora;
    get flora() { return this._flora; }
    private _map;
    get map() { return this._map; }
    private _tiles: Tile[] = [];
    get tiles(): Readonly<Tile[]> { return this._tiles; }

    // chunk coords
    private chunkX = 0;
    private chunkY = 0;
    get x() { return this.chunkX; }
    get y() { return this.chunkY; }

    // game units...
    private _position: Readonly<WorldCoordinate>;
    private _area: Rectangle;
    get position() { return this._position; }
    get area() { return this._area; }
    private _distance;
    get distance() { return this._distance; }

    private _active = false;
    get active() { return this._active; }
    set active(value) {
        if(value == this._active) return;
        // console.log(`setting chunk to ${value == true ? "active" : "inactive" }`, this);
        // TODO: one last check to prevent deactivating a chunk that a player is in
        // if(value == false) console.log(`Deactivating chunk at ${this.coordinate}`);
        // else console.log(`Activating chunk at ${this.coordinate}`);
        this._active = value;

        const chunkEvent: ChunkEvent = {
            chunk: this
        };
        Events.RaiseEvent(Events.List.ChunkActiveChanged, chunkEvent);
    }

    constructor(options: ChunkOptions) {

        this._biome = options.biome;
        this.chunkX = options.x;
        this.chunkY = options.y;
        this.active = options.active;
        this._tiles = options.tiles;
        this._seed = new Seed(options.gameMap.Seed.Random());

        // values for world generation
        this._distance = Math.abs(this.chunkX) + Math.abs(this.chunkY);
        this._danger = this._seed.Random(Math.max(this._distance - 1, 0), this._distance + 1) + 1;
        this._hostility = this._seed.Random(1, this._danger);
        // TODO: base this off adjacent flora value (like be +- that value), not totally random
        this._flora = this._seed.Random(1, 10);

        this._map = options.gameMap;
        this.map.AddChunk(this);
        // game units
        const thisWorldPos = Chunk.getWorldCoordinate(new Point(this.chunkX, this.chunkY));
        this._position = new WorldCoordinate(thisWorldPos.x, thisWorldPos.y);
        this._area = new Rectangle(this._position.x, this._position.y, Chunk.CHUNK_SIZE, Chunk.CHUNK_SIZE);

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

    getTile(x: number, y: number) {
        for(let tile of this._tiles) {
            if(tile.x == x && tile.y == y) return tile;
        }
        return null;
    }

    equals(chunk: Chunk) {

        if(!(chunk instanceof Chunk)) return false;

        return chunk.x == this.x
            && chunk.y == this.y;
    }
}
