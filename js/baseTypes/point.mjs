import Map from '../mapping/map.mjs';

export default class Point {

    #chunk = null;
    #x = 0;
    #y = 0;

    get x() {
        return this.#x;
    }

    set x(value) {
        this.#x = value;
        this.#chunk = Map.Map.getChunk(this);
    }

    get y() {
        return this.#y;
    }

    set y(value) {
        this.#y = value;
        this.#chunk = Map.Map.getChunk(this);
    }

    get chunk() {
        return this.#chunk;
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.#chunk = Map.Map.getChunk(this);
    }

    equals(point) {
        if(point == null) return false;
        
        return this.x == point.x && this.y == point.y;
    }

    distance(point) {
        return Math.abs(this.x - point.x)
            + Math.abs(this.y - point.y);
    }
}