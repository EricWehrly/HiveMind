import Chunk from "../mapping/chunk";
import Point from "./point"
import GameMap from '../mapping/GameMap';

export default class WorldCoordinate extends Point {

    private _chunk: Chunk = null;

    get chunk() {
        if(this._chunk == null) {
            this._chunk = GameMap.Instance.GetChunk(this);
        }
        return this._chunk;
    }

    get x() { return super.x; }
    get y() { return super.y; }

    set x(value: number) {
        super.x = value;
        this._chunk = GameMap.Instance.GetChunk(this);
    }

    set y(value: number) {
        super.y = value;
        this._chunk = GameMap.Instance.GetChunk(this);
    }

    constructor(x: number, y: number) {
        super(x, y);
        this._chunk = GameMap.Instance.GetChunk(this);
    }

    set(x: number, y: number) {
        super.x = x;
        super.y = y;
        this._chunk = GameMap.Instance.GetChunk(this);
    }

    update(point: Readonly<WorldCoordinate>) {
        super.update(point);
        this._chunk = point.chunk;
    }
}
