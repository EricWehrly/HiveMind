import Renderer from "./rendering/renderer-dom.mjs";
import { RegisterLoopMethod } from "./loop.mjs";

// TODO: Global reference somewhere somehow
const GRID_SIZE = 32;
const SCREEN_BORDER_PADDING = 4;

/*
    follow player

    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount
    */

export default class Camera {

    static #instance;
    static #target;

    static get() {
        return Camera.#instance;
    }

    constructor() {
        Camera.#instance = this;
        if(window) window.Camera = this;
        
        this.#renderloop();
    }

    // pixels
    getViewPortSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    // game units
    getScreenRect() {

        if(Camera.#target == null) return {};

        const viewport = this.getViewPortSize();
        const gridHalfWidth = (viewport.width / 2) / GRID_SIZE;
        const gridHalfHeight = (viewport.height / 2) / GRID_SIZE;

        // TODO: cache
        return {
            x: Camera.#target.position.x - gridHalfWidth,
            y: Camera.#target.position.y - gridHalfHeight,
            width: gridHalfWidth * 2,
            height: gridHalfHeight * 2
        }
    }

    setTarget(target) {
        Camera.#target = target;
    }

    #renderloop() {
        // we can expand this to encapsulate all renderers, later
        Renderer.Render(this.getScreenRect());

        window.requestAnimationFrame(this.#renderloop.bind(this));
    }
}
