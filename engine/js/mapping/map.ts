import WorldCoordinate from "../coordinates/WorldCoordinate";
import Seed from "../core/seed.mjs";
import SentientLivingEntity from "../entities/character/SentientLivingEntity";
import Events from "../events";
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

        //@ts-expect-error
        if(Map._map == null) window.map = Map._map = this;

        this._seed = new Seed(seed.Random());
        
        Events.Subscribe(Events.List.CharacterCreated, this._characterCreated.bind(this));
        Events.Subscribe(Events.List.PlayerChunkChanged, this._playerChunkChanged.bind(this));
    }

    // TODO: Allow differint starting points to be passed in
    // should we have an option about whether to include the originating chunk?
    getNearbyChunks(
        startingChunk: Chunk,
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
                from: toChunk,
                to: toChunk
            })
        }
    }

    private _playerChunkChanged(event: { from: Chunk, to: Chunk }) {

        const chunksNearFrom = this.getNearbyChunks(event.from);
        const chunksNearTo = this.getNearbyChunks(event.to);
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

    getChunk(worldCoordinate: WorldCoordinate): Chunk;
    getChunk(x: number, y: number): Chunk;
    
    getChunk(xOrPoint: number | WorldCoordinate, y?: number): Chunk {
        if (xOrPoint instanceof WorldCoordinate) {
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

        if(CHUNK_SOFT_LIMIT < Object.keys(this._chunks).length) {
            console.warn(`Chunk limit reached (${Object.keys(this._chunks).length})`);
        };
        
        return (!(coordinate in this._chunks))
            && CHUNK_SOFT_LIMIT > Object.keys(this._chunks).length;
            // && (character?.isPlayer || coordinate == "0,0");
            // && (Events.Context?.character?.isPlayer || coordinate == "0,0");
    }

    addChunk(chunk: Chunk) {

        this._chunks[chunk.coordinate] = chunk;
    }
}
