import addCustomStyle from "../util/custom-style";

export default class TileManager {

    static get GRID_SIZE() {
        return 32;
    }
}

addCustomStyle(`:root {
    --gridSize: ${TileManager.GRID_SIZE};
}`);

// draw a grid

// determine some tiles

// fill the grid?

// on window resize, redraw grid ...
