
export default class BlackoutMap {

    // internal map of blocked positions
    #internalMap = {};

    /**
     * 
     * @param {Rectangle[]} areas An array of areas on the map to compose the blackout map.
     */
    constructor(areas = []) {

        for(var area of areas) {
            this.add(area);
        }
    }

    /**
     * 
     * @param {Rectangle} area 
     */
    add(area) {

        for(var x = area.x; x < area.x + area.width; x++) {
            for(var y = area.y; y < area.y + area.height; y++) {
                this.#internalMap[`${x},${y}`] = true;
            }
        }
    }

    isBlocked(x, y) {

        // reference the internal map to see if this position is available
        return this.#internalMap[`${x},${y}`];
    }
}
