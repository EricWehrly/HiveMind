export default class Vector {
    private _x: number;
    private _y: number;

    get x() { return this._x; }
    get y () { return this._y; }

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

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

    get normalized() {
        const magnitude = Math.sqrt(this._x * this._x + this._y * this._y);
        if (magnitude === 0) {
            // throw new Error('Cannot normalize a zero vector');
            return new Vector(0, 0);
        }

        return new Vector(this._x / magnitude, this._y / magnitude);
    }
}
