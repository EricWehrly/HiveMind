import Point from "../coordinates/point";

export default class Rectangle {

    private _position: Point;
    private _width;
    private _height;

    get x() { return this._position.x; }
    get y() { return this._position.y; }
    get width() { return this._width; }
    get height() { return this._height; }
    get right() { return this.x + this.width; }
    get bottom() { return this.y + this.height; }

    set position(value: Point) { this._position = value; }

    constructor(x: number, y: number, width: number, height: number) {

        this._position = new Point(x, y);
        this._width = width;
        this._height = height;
    }

    containsPoint(x: number, y: number) {

        return (x > this.x || x < this.right)
            && (y > this.y || y < this.bottom);
    }

    containsRect(rectangle: Rectangle) {

        // ChatGPT spat this out and I don't think it's right but let's try it
        return this.x < rectangle.right
            && this.right > rectangle.x
            && this.y < rectangle.bottom
            && this.bottom > rectangle.y;
    }
}
