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
        Events.Subscribe(Events.List.PlayerChunkChanged, this.#playerChunkChanged.bind(this));
    }

    // TODO: Allow differint starting points to be passed in
    // should we have an option about whether to include the originating chunk?
    getNearbyChunks(startingChunk, distance) {

        if(startingChunk == null) return;
        if(!distance) distance = 1;
        distance = Math.abs(distance);

        const nearbyChunks = [];
        for(var deltaX = distance * -1; deltaX <= distance; deltaX++) {
            for(var deltaY = distance * -1; deltaY <= distance; deltaY++) {
                if(deltaX == 0 && deltaY == 0) continue;
                const coordinate = (startingChunk.x + deltaX) + ","
                    + (startingChunk.y + deltaY);
                    // console.log(`Looking for chunk at ${coordinate}`);
                const chunk = this.#chunks[coordinate];
                // if distance to startingChunk is 1?
                if(chunk) nearbyChunks.push(chunk);
            }
        }

        console.log(`${nearbyChunks.length} chunks within ${distance} of chunk ${startingChunk}`);
        return nearbyChunks;
    }

    // event has:
    // character, from, to
    #playerChunkChanged(event) {
        console.log("New chunk!");
        console.log(event);

        const nearbyChunks = this.getNearbyChunks(event.from);

        // deactivate chunks we're moving away from
        // activate chunks we're moving toward
    }

    #playerMoved(event) {
        const character = event.character || event;

        const chunk = character.position.chunk;

        const edge = this.#closeToChunkEdge(character.position);
        
        // if the player is approaching the edge of their chunk
        // make sure there's another chunk next to it
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

    addChunk(chunk) {
        this.#chunks[chunk.coordinate] = chunk;
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

    /**
     * 
     * @param {Chunk} chunk 
     */
    addChunk(chunk) {

        this.#chunks[chunk.coordinate] = chunk;
    }
}
