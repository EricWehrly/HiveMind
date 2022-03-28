import { RegisterLoopMethod } from "../loop.mjs";

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

        if(this.entity) RegisterLoopMethod(this.followEntity.bind(this), false);
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
            this.followEntity();
            this.Element.style.display = "inline-block";
        }
    }

    followEntity() {
        if(this.message != null && this.message != "") {
            let position = this.entity.getScreenPosition();
            // TODO: Add entity height to y
            this.Element.style.left = position.x + "px";
            this.Element.style.top = position.y + "px";
        }
    }
}
