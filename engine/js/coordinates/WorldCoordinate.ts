import Chunk from "../mapping/chunk";
import Point from "./point"
import Map from '../mapping/map';

export default class WorldCoordinate extends Point {

    private _chunk: Chunk = null;

    get chunk() {
        if(this._chunk == null) {
            this._chunk = Map.Map.getChunk(this);
        }
        return this._chunk;
    }

    get x() { return super.x; }
    get y() { return super.y; }

    set x(value: number) {
        super.x = value;
        this._chunk = Map.Map.getChunk(this);
    }

    set y(value: number) {
        super.y = value;
        this._chunk = Map.Map.getChunk(this);
    }

    constructor(x: number, y: number) {
        super(x, y);
        this._chunk = Map.Map.getChunk(this);
    }

    update(point: WorldCoordinate) {
        super.update(point);
        this._chunk = point.chunk;
    }
}
