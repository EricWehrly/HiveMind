import UIElement from "./ui-element.mjs";

// TODO: timeout / hide
export default class Tooltip extends UIElement {

    #message;

    constructor(options = {}) {

        super(options);

        // TODO: reject if not given required parameters
        // screen position, NOT grid position!
        const position = options.position || {x: 0, y: 0};
        this.entity = options.entity || null;

        this.addClass("tooltip");
        this.Element.style.left = position.x + "px";
        this.Element.style.top = position.y + "px";

        this.message = options.message || "";
        this.visible = this.message != "";
    }

    get message() {
        return this.#message;
    }

    set message(newValue) {
        if(newValue == this.#message) return;

        this.#message = newValue;
        this.Element.innerHTML = this.message;
        
        this.visible = this.message != "";
    }
}
