import Listed from "../baseTypes/listed";
import Point from "../coordinates/point";
import GameMap from "./GameMap";

export interface BiomeOptions {
    biomeType: BiomeType;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface BiomeTypeOptions {
    name: string;
    color?: string;
    minSize: number;
    maxSize: number;
}

export class BiomeType extends Listed {

    #minWidth = 1;
    get minWidth() { return this.#minWidth; }
    #maxWidth = 10;
    get maxWidth() { return this.#maxWidth; }
    #minHeight = 1;
    get minHeight() { return this.#minHeight; }
    #maxHeight = 10;
    get maxHeight() { return this.#maxHeight; }

    constructor(options: BiomeTypeOptions) {

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

    constructor(options: BiomeOptions) {

        this.#x = options.x;
        this.#y = options.y;
        this.#width = options.width;
        this.#height = options.height;
        
        GameMap.Instance.AddBiome(this);
    }

    contains(coordinates: Point) {

        return false;
    }
}
