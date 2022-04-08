import Renderer from "./rendering/renderer-dom.mjs";
import { RegisterLoopMethod } from "./loop.mjs";

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
        
        RegisterLoopMethod(this.#renderloop.bind(this), true);
    }

    getScreenRedt() {
        return {
            x: 2,
            y: 3,
            width: 200,
            height: 100
        }
    }

    setTarget(target) {
        Camera.#target = target;
    }

    #renderloop(elapsed) {
        // we can expand this to encapsulate all renderers, later
        Renderer.Render(this.getScreenRedt());
    }
}
