import Chunk from "../mapping/chunk";
import Point from "./point"
import GameMap from '../mapping/GameMap';

export default class WorldCoordinate extends Point {

    private _chunk: Chunk = null;

    get chunk() {
        if(this._chunk == null) {
            this._chunk = GameMap.Instance.getChunk(this);
        }
        return this._chunk;
    }

    get x() { return super.x; }
    get y() { return super.y; }

    set x(value: number) {
        super.x = value;
        this._chunk = GameMap.Instance.getChunk(this);
    }

    set y(value: number) {
        super.y = value;
        this._chunk = GameMap.Instance.getChunk(this);
    }

    constructor(x: number, y: number) {
        super(x, y);
        this._chunk = GameMap.Instance.getChunk(this);
    }

    update(point: WorldCoordinate) {
        super.update(point);
        this._chunk = point.chunk;
    }
}
