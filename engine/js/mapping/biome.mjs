import Listed from "../baseTypes/listed.mjs";
import Map from '../mapping/map.mjs';

export class BiomeType extends Listed {

    #minWidth = 0;
    #maxWidth = 10;
    #minHeight = 0;
    #maxHeight = 10;

    constructor(options) {

        super(options);
    }
}

export default class Biome {

    #x;
    #y;
    #width;
    #height;

    get width() { return this.#width; }
    get height() { return this.#height; }

    get coordinate() {
        
        return this.#x + "," + this.#y;
    }

    /**
     * 
     * @param {BiomeType} options.biomeType
     * @param {Integer} options.width
     * @param {Integer} options.height
     */
    constructor(options) {

        if(!options.biomeType) throw "Expected biomeType to create biome.";
        // console.assert(typeof options.biomeType == BiomeType);
        if(!options.width) throw "Expected width to create biome.";
        if(!options.height) throw "Expected height to create biome.";
        
        Map.Map.addBiome(this);
    }

    contains(coordinates) {

        return false;
    }
}
