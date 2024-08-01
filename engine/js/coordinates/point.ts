export default class Point {
    private _x = 0;
    private _y = 0;

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    equals(point: Point) {
        if(point == null) return false;
        
        return this.x == point.x && this.y == point.y;
    }

    distance(point: Point) {
        return Math.abs(this.x - point.x)
            + Math.abs(this.y - point.y);
    }

    update(point: Point) {
        this._x = point.x;
        this._y = point.y;
    }

    toString() {
        return this._x + ", " + this._y;
    }
}
