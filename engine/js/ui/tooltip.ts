import Entity from "../entities/character/Entity";
import UIElement, { UIElementOptions } from "./ui-element";

export interface TooltipOptions extends UIElementOptions {
    position?: {x: number, y: number};
    entity?: Entity;
    message?: string;
}

// TODO: timeout / hide
export default class Tooltip extends UIElement {

    private _message: string;

    constructor(options: TooltipOptions = {}) {

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
        return this._message;
    }

    set message(newValue) {
        if(newValue == this._message) return;

        this._message = newValue;
        this.Element.innerHTML = this.message;
        
        this.visible = this.message != "";
    }
}
