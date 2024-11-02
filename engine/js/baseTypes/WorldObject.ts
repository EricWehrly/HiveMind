import WorldCoordinate from "../coordinates/WorldCoordinate";
import Vector from "./Vector";
import Rectangle from "./rectangle";

export interface WorldObjectOptions {
    position?: { x: number, y: number };
}

export default class WorldObject {
    
    private _position: WorldCoordinate = new WorldCoordinate(0, 0);
    private _facing: Readonly<Vector> = new Vector(0, 0);
    private _rotation: number = 0;
    private _area: Rectangle = new Rectangle(0, 0, 0, 0);

    // prevent trying to set x and y
    get x() { return this._position.x; }
    get y() { return this._position.y; }

    get area() { return this._area; }
    get facing(): Readonly<Vector> { return this._facing; }
    set facing(newValue: Vector) { 
        this._facing.update(newValue.x, newValue.y);
    }

    get position(): Readonly<WorldCoordinate> {
        return this._position;
    }

    set position(options: { x?: number, y?: number }) {
        if(options.x == null && options.y == null) return;

        this._position.set(
            options.x || this._position.x,
            options.y || this._position.y);

        this._area.position = this._position;
    }

    get rotation() { return this._rotation; }

    set rotation(newValue) { this._rotation = newValue; }

    constructor(options: WorldObjectOptions = {}) {
        
        if(options.position) { 
            this._position = new WorldCoordinate(options.position.x, options.position.y);
            delete options.position;    // we should remove this line
            this._area.position = this._position;
        };
    }
}
