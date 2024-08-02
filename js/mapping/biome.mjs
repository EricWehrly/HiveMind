import Listed from "../baseTypes/listed.ts";
import Map from './map.ts';

export class BiomeType extends Listed {

    #minWidth = 1;
    get minWidth() { return this.#minWidth; }
    #maxWidth = 10;
    get maxWidth() { return this.#maxWidth; }
    #minHeight = 1;
    get minHeight() { return this.#minHeight; }
    #maxHeight = 10;
    get maxHeight() { return this.#maxHeight; }

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

        this.#x = options.x;
        this.#y = options.y;
        this.#width = options.width;
        this.#height = options.height;
        
        Map.Instance.addBiome(this);
    }

    contains(coordinates) {

        return false;
    }
}
