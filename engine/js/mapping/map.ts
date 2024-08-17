import Point from "../coordinates/point";
import Seed from "../core/seed";
import SentientEntity from "../entities/character/SentientEntity";
import Events from "../events";
import Biome, { BiomeType } from "./biome";
import Chunk from "./chunk";

// TODO: test this at very low numbers so that we can know what happens when we approach it (and deal with that)
const CHUNK_SOFT_LIMIT = 5000;

// TODO: export the instance, not the class
export default class Map {

    private static _instance: Map;
    static get Instance() {
        return this._instance;
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

        if(Map._instance == null) {
            Map._instance = this;
            window.map = this;
        }

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
                const chunkCoordinate = new Point(
                    startingChunk.x + deltaX,
                    startingChunk.y + deltaY
                );
                const chunk = this.getChunkFromCoordinate(chunkCoordinate);
                if(chunk && nearbyChunks.indexOf(chunk) == -1) {
                    nearbyChunks.push(chunk);
                }
            }
        }

        // console.log(`${nearbyChunks.length} chunks within ${distance} of chunk at ${startingChunk.coordinate}`);
        return nearbyChunks;
    }

    private _characterCreated(event: { character: SentientEntity}) {

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

    getBiome(point: Point) {

        for(var biome of this._biomes) {
            if(biome.contains(point)) {
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
            x: point.x,
            y: point.y
        });
    }
    
    getChunk(point: Point): Chunk {
        const chunkCoordinate = Chunk.getChunkCoordinate(point);
        return this.getChunkFromCoordinate(chunkCoordinate);
    }

    private getChunkFromCoordinate(point: Point) {
        // TODO: ensure X an Y are not point coordinates ...

        const coordinate = point.toString();
        if(this.shouldMakeNewChunk(coordinate)) {
            const active = Object.keys(this._chunks).length == 0;
            const biome = this.getBiome(point);
            // if(Events.Context?.character?.isPlayer) ...
            new Chunk({
                biome,
                active,
                map: this,
                x: point.x,
                y: point.y
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
