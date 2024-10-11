export enum CARDINAL_DIRECTION {
    'East',
    'South',
    'West',
    'North'
}

// should 'NormalizedVector' be a class
// even if it only needs to imply, not itself necessarily constrain the normalization?

export default class Vector {
    private _x: number;
    private _y: number;

    get x() { return this._x; }
    set x(value: number) {
        this._x = value;
        this.onChanged(this);
    }
    get y () { return this._y; }
    set y(value: number) { 
        this._y = value;
        this.onChanged(this);
    }

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this.onChanged = () => {};
    }

    update(x: number, y: number) {
        this._x = x;
        this._y = y;
        this.onChanged(this);
    }

    onChanged: (vector: Vector) => void;

    add(firstParam: Vector | number, secondParam?: number) {
        if(firstParam instanceof Vector) {
            this._x += firstParam.x;
            this._y += firstParam.y;
        } else {
            this._x += firstParam;
            this._y += secondParam;
        }
    }

    multiply(firstParam: Vector | number) {
        if(firstParam instanceof Vector) {
            this._x *= firstParam.x;
            this._y *= firstParam.y;
        } else {
            this._x *= firstParam;
            this._y *= firstParam;
        }
    }

    get cardinalDirection(): CARDINAL_DIRECTION {
        const angle = Math.atan2(this._y, this._x) * 180 / Math.PI;
        const index = Math.round(((angle + 360) % 360) / 90) % 4;
        return index;
    }

    get normalized() {
        const magnitude = Math.sqrt(this._x * this._x + this._y * this._y);
        if (magnitude === 0) {
            // throw new Error('Cannot normalize a zero vector');
            return new Vector(0, 0);
        }

        return new Vector(this._x / magnitude, this._y / magnitude);
    }

    equals(other: Vector) {
        return this._x === other.x && this._y === other.y;
    }

    toString() {
        return `(${this._x}, ${this._y})`;
    }
}
