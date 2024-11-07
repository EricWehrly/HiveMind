export default class Tile {

    x: Readonly<number> = 0;
    y: Readonly<number> = 0;
    z: Readonly<number> = 0;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;        
    }
}
