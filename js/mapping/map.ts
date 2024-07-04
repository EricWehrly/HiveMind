import Point from "../baseTypes/point.mjs";
import Seed from "../core/seed.mjs";
import SentientLivingEntity from "../entities/character/SentientLivingEntity.js";
import Events from "../events.mjs";
import Biome, { BiomeType } from "./biome.mjs";
import Chunk from "./chunk";

// TODO: test this at very low numbers so that we can know what happens when we approach it (and deal with that)
const CHUNK_SOFT_LIMIT = 5000;

// TODO: export the instance, not the class
export default class Map {

    private static _map: Map;
    static get Map() {
        return this._map;
    };

    static {

        //@ts-ignore
        Events.Subscribe(Events.List.ChunkCreated, this._chunkCreated.bind(this));
    }

    private static _chunkCreated(chunk: Chunk, eventOptions: any) {

        // TODO: This needs to be tested (console log fires when in 2p)
        if(eventOptions.isNetworkOriginEvent == false) return;
        console.log(`new chunk came from outside the house`);

        // TODO:
        // if it's in conflict with a chunk we have, raise an alarm
        // otherwise, add to the current(?) map
    }

    private _chunks: Record<string, Chunk> = {};
    private _biomes: Biome[] = [];
    private _seed;

    get chunks() { return this._chunks; }

    get Seed() { return this._seed; }

    // TODO: proper implementation (based on difficulty at generation time)
    get size() { return 100; }

    constructor(seed: Seed) {

        if((seed instanceof Seed) == false) {
            const message = `Cannot construct map without seed.`;
            console.error(message);
            debugger;
            throw message;
        }

        //@ts-ignore
        if(Map._map == null) window.map = Map._map = this;

        this._seed = new Seed(seed.Random());
        
        //@ts-ignore
        Events.Subscribe(Events.List.CharacterCreated, this._characterCreated.bind(this));
        //@ts-ignore
        Events.Subscribe(Events.List.PlayerChunkChanged, this._playerChunkChanged.bind(this));
    }

    // TODO: Allow differint starting points to be passed in
    // should we have an option about whether to include the originating chunk?
    getNearbyChunks(
        startingChunk: Chunk,
        character?: SentientLivingEntity,
        distance: number = 2)
        : Chunk[] {

        if(startingChunk == null) return [];
        distance = Math.abs(distance);

        const nearbyChunks: Chunk[] = [];
        for(var deltaX = distance * -1; deltaX <= distance; deltaX++) {
            for(var deltaY = distance * -1; deltaY <= distance; deltaY++) {
                if(deltaX == 0 && deltaY == 0) continue;
                const x = startingChunk.x + deltaX;
                const y = startingChunk.y + deltaY;
                const chunk = this.getChunk(x, y);
                if(chunk && nearbyChunks.indexOf(chunk) == -1) {
                    nearbyChunks.push(chunk);
                }
            }
        }

        // console.log(`${nearbyChunks.length} chunks within ${distance} of chunk at ${startingChunk.coordinate}`);
        return nearbyChunks;
    }

    private _characterCreated(event: { character: SentientLivingEntity}) {

        if(event?.character?.isPlayer) {
            const toChunk = event.character.position.chunk;
            this._playerChunkChanged({
                character: event.character,
                from: toChunk,
                to: toChunk
            })
        }
    }

    private _playerChunkChanged(event: { character: SentientLivingEntity, from: Chunk, to: Chunk }) {

        const chunksNearFrom = this.getNearbyChunks(event.from, event.character);
        const chunksNearTo = this.getNearbyChunks(event.to, event.character);
        chunksNearFrom.forEach(chunk => {

            // console.log(`Chunk at ${chunk.coordinate} active: ${chunk.active}`);
            if(chunk != event.to 
                && !chunksNearTo.includes(chunk)) {
                    chunk.active = false;
                }
        });
        chunksNearTo.forEach(chunk => {
            chunk.active = true;
        });
        event.to.active = true;
    }

    private _playerMoved(event: { character: SentientLivingEntity } ) {
        if(!event.character) debugger;
        const character = event.character;
        if(!character.isPlayer) return;

        const chunk = character.position.chunk;

        const edge = this._closeToChunkEdge(character.position);
        
        // if the player is approaching the edge of their chunk
        // make sure there's another chunk next to it
        if(edge == "left") this.getChunk(
            chunk.x - 1,
            chunk.y
        );
        
        if(edge == "right") this.getChunk(
            chunk.x + 1,
            chunk.y
        );
        
        if(edge == "top") this.getChunk(
            chunk.x,
            chunk.y - 1
        );
        
        if(edge == "bottom") this.getChunk(
            chunk.x,
            chunk.y + 1
        );
    }

    private _closeToChunkEdge(point: Point) {

        const margin = 2;
        let x = point.x;
        let y = point.y;

        while(x >= Chunk.CHUNK_SIZE) {
            x -= Chunk.CHUNK_SIZE;
        }
        while(y >= Chunk.CHUNK_SIZE) {
            y -= Chunk.CHUNK_SIZE;
        }

        // TODO: enum
        if(x < margin) return "left";
        if(10 - x < margin) return "right";
        if(y < margin) return "top";
        if(10 - y < margin) return "bottom";
        return false;
    }

    addBiome(biome: Biome) {
        this._biomes.push(biome);
    }

    getBiome(options: { x: number, y: number }) {

        if(options.x != null && options.y != null) {

            for(var biome of this._biomes) {
                if(biome.contains(options)) {
                    return biome;
                }
            }
            // TODO: determine BiomeType to use based on adjacent biomes
            const biomeType = BiomeType.Get("Grasslands");
            const width = Math.round(this.Seed.Random(biomeType.minWidth, biomeType.maxWidth));
            const height = Math.round(this.Seed.Random(biomeType.minHeight, biomeType.maxHeight));
            return new Biome({
                biomeType,
                width,
                height,
                ...options
            });
        } else {
            console.error(`Don't know how to look up biome for ${options}`);
        }
    }

    getChunk(point: Point): Chunk;
    getChunk(x: number, y: number): Chunk;
    
    getChunk(xOrPoint: number | Point, y?: number): Chunk {
        if (xOrPoint instanceof Point) {
            const chunkCoordinate = Chunk.getChunkCoordinate(xOrPoint.x, xOrPoint.y);
            return this.getChunk(chunkCoordinate.x, chunkCoordinate.y);
        } else if (typeof xOrPoint === 'number' && typeof y === 'number') {
            return this.getChunkFromCoordinate(xOrPoint, y);
        } else {
            throw new Error('Invalid arguments');
        }
    }

    private getChunkFromCoordinate(x: number, y: number) {
        // TODO: ensure X an Y are not point coordinates ...

        // can this just be chunkCoordinate.toString?
        const coordinate = x + "," + y;
        if(this.shouldMakeNewChunk(coordinate)) {
            const active = Object.keys(this._chunks).length == 0;
            const biome = this.getBiome({x, y});
            // if(Events.Context?.character?.isPlayer) ...
            console.log(`making chunk at ${coordinate}`)
            new Chunk({
                biome,
                active,
                map: this,
                x,
                y
            });
        }
        return this._chunks[coordinate];
    }

    private shouldMakeNewChunk(coordinate: string) {
        
        // TODO: Do we have to use Events.Context, rather than have character passed in?
        return (!(coordinate in this._chunks)) //@ts-ignore // Events.Context probly too hack for typescript
            && CHUNK_SOFT_LIMIT > Object.keys(this._chunks).length;
            // && (character?.isPlayer || coordinate == "0,0");
            // && (Events.Context?.character?.isPlayer || coordinate == "0,0");
    }

    addChunk(chunk: Chunk) {

        this._chunks[chunk.coordinate] = chunk;
    }
}
