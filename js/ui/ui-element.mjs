import Renderer from '../rendering/renderer.mjs';

export default class UIElement {

    // css classes to apply
    static SCREEN_ZONE = {
        BOTTOM_LEFT: "bottom,left",
        BOTTOM_MIDDLE: "bottom,middle",
        BOTTOM_RIGHT: "bottom,right",
        TOP_RIGHT: "top,right",
        TOP_MIDDLE: "top,middle",
        TOP_LEFT: "top,left"
    }

    static #UI_ELEMENTS = []

    static {
        Renderer.RegisterRenderMethod(10, UIElement.#ui_loop);
    }

    static #ui_loop(screenRect) {
    
        for(var element of UIElement.#UI_ELEMENTS) {
            // if character in screenRect
            element.redraw(screenRect);
            // redraw(character, screenRect);
        }
    }

    _visible = true

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        // if element 
        // this.Element.style.display
    }

    constructor(options = {}) {

        this.screenZone = options.screenZone || UIElement.SCREEN_ZONE.BOTTOM_MIDDLE;

        this.Element = document.createElement('div');
        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        // TODO: ui shouldnt be on 'playfield'...
        document.getElementById("playfield").appendChild(this.Element);

        UIElement.#UI_ELEMENTS.push(this);
    }

    addClass(className) {
        this.Element.className += ` ${className}`;
    }
    
    removeClass(className) {
        this.Element.className = this.Element.className.replace(className, "").trim();
    }

    redraw(screenRect) {
        
        if(this.entity) {

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
