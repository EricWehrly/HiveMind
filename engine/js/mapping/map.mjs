import Events from "../events.mjs";
import Chunk from "./chunk.mjs";

export default class Map {

    static #map;
    static get Map() {
        return this.#map;
    };

    static {

        Events.Subscribe(Events.List.ChunkCreated, this.#chunkCreated.bind(this));
    }

    static #chunkCreated(chunk, eventOptions) {

        // TODO: This needs to be tested (console log fires when in 2p)
        console.log(`New chunk at ${chunk.x}, ${chunk.y}`);
        if(eventOptions.isNetworkOriginEvent == false) return;
        console.log(`it came from outside the house`);

        // TODO:
        // if it's in conflict with a chunk we have, raise an alarm
        // otherwise, add to the current(?) map
    }

    #chunks = {};

    constructor() {
        if(Map.#map == null) window.map = Map.#map = this;
        // hook into player move event
        // generate chunk if needed
        
        Events.Subscribe(Events.List.CharacterCreated, this.#playerMoved.bind(this));
        Events.Subscribe(Events.List.PlayerMoved, this.#playerMoved.bind(this));
    }

    addChunk(chunk) {
        this.#chunks[chunk.coordinate] = chunk;
    }

    #playerMoved(event) {
        const character = event.character || event;
        // console.log("'e moved, then.");

        const chunk = character.position.chunk;

        const edge = this.#closeToChunkEdge(character.position);
        
        if(edge == "left") this.getChunk({
            x: chunk.x - 1,
            y: chunk.y
        });
        
        if(edge == "right") this.getChunk({
            x: chunk.x + 1,
            y: chunk.y
        });
        
        if(edge == "top") this.getChunk({
            x: chunk.x,
            y: chunk.y - 1
        });
        
        if(edge == "bottom") this.getChunk({
            x: chunk.x,
            y: chunk.y + 1
        });


        // if the player is approaching the edge of their chunk
        // make sure there's another chunk next to it
    }

    #closeToChunkEdge(point) {

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

    getChunk(options) {

        if(options.x != null && options.y != null) {

            const chunkCoordinate = Chunk.getChunkCoordinate(options.x, options.y);

            const coordinate = chunkCoordinate.x + "," + chunkCoordinate.y;
            if(!(coordinate in this.#chunks)) {
                new Chunk(chunkCoordinate);
            }
            return this.#chunks[coordinate];
        } else {
            console.error(`Don't know how to look up chunk for ${options}`);
        }
    }

    createChunk() {

    }

    /**
     * 
     * @param {Chunk} chunk 
     */
    addChunk(chunk) {

        this.#chunks[chunk.coordinate] = chunk;
    }
}
