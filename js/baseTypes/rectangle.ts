export default class Rectangle {

    #x;
    #y;
    #width;
    #height;

    get x() { return this.#x; }
    get y() { return this.#y; }
    get width() { return this.#width; }
    get height() { return this.#height; }
    get right() { return this.x + this.width; }
    get bottom() { return this.y + this.height; }

    constructor(x: number, y: number, width: number, height: number) {

        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
    }

    containsPoint(x: number, y: number) {

        return (x > this.#x || x < this.right)
            && (y > this.#y || y < this.bottom);
    }

    containsRect(rectangle: Rectangle) {

        // ChatGPT spat this out and I don't think it's right but let's try it
        return this.x < rectangle.right
            && this.right > rectangle.x
            && this.y < rectangle.bottom
            && this.bottom > rectangle.y;
    }
}
