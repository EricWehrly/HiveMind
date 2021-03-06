export default class Point {
    x = 0;
    y = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(point) {
        return this.x == point.x && this.y == point.y;
    }

    distance(point) {
        return Math.abs(this.x - point.x)
            + Math.abs(this.y - point.y);
    }
}