import { RegisterLoopMethod } from "../loop.mjs";
import Renderer from '../rendering/renderer.mjs';

// TODO: timeout / hide
export default class Tooltip {

    #message;

    constructor(options = {}) {

        // TODO: reject if not given required parameters
        // screen position, NOT grid position!
        const position = options.position || {x: 0, y: 0};
        this.entity = options.entity || null;

        this.Element = document.createElement('div');
        this.Element.className = 'ui tooltip';
        this.Element.style.left = position.x + "px";
        this.Element.style.top = position.y + "px";

        document.getElementById("playfield").appendChild(this.Element);
        this.message = options.message || "";
        
        Renderer.RegisterRenderMethod(10, this.redraw.bind(this));
    }

    get message() {
        return this.#message;
    }

    set message(newValue) {
        if(newValue == this.#message) return;

        this.#message = newValue;
        this.Element.innerHTML = this.message;
        // TODO: show/hide methods?
        if(this.#message == null || this.#message == "") this.Element.style.display = "none";
        else {
            // this.followEntity();
            this.Element.style.display = "inline-block";
        }
    }

    // TODO: No, this needs to go in the renderer
    redraw(screenRect) {
        if(this.message != null && this.message != ""
            && this.entity) {

            // TODO: get grid size constant
            const gridSize = 32;

            const offsetPosition = {
                x: this.entity.position.x - screenRect.x,
                y: this.entity.position.y - screenRect.y
            };
            let targetY = gridSize * offsetPosition.y;
            if(this.entity?.graphic?.style?.height) {
                targetY -= parseInt(this.entity.graphic.style.height);
            }

            this.Element.style.left = (gridSize * offsetPosition.x) + "px";
            this.Element.style.top = targetY + "px";
        }
    }
}
