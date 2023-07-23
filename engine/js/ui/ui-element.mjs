import Renderer from '../rendering/renderer.mjs';

export default class UIElement {

    // css classes to apply
    static SCREEN_ZONE = {
        NONE: "",
        BOTTOM_LEFT: "bottom left",
        BOTTOM_CENTER: "bottom center",
        BOTTOM_RIGHT: "bottom right",
        TOP_RIGHT: "top right",
        TOP_CENTER: "top center",
        TOP_LEFT: "top left",
        MIDDLE_RIGHT: "middle right"
    }

    static #UI_ELEMENTS = []
    static #initialDisplay = "none";

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

    #visible = true

    get visible() {
        return this.#visible;
    }

    set visible(value) {
        this.#visible = value;
        if(this.Element && this.#visible) this.Element.style.display = UIElement.#initialDisplay;
        if(this.Element && !this.#visible) this.Element.style.display = "none";
    }

    constructor(options = {}) {

        this.screenZone = options.screenZone || UIElement.SCREEN_ZONE.NONE;

        this.Element = document.createElement('div');
        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        // TODO: ui shouldnt be on 'playfield'...
        document.getElementById("ui-container").appendChild(this.Element);
        UIElement.#initialDisplay = this.Element.style.display;

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

            const entityHeight = this.entity.graphic.offsetHeight;
            const offsetPosition = {
                x: this.entity.position.x - screenRect.x,
                y: this.entity.position.y - screenRect.y
            };
            let targetY = gridSize * offsetPosition.y;
            if(this.entity?.graphic?.style?.height) {
                // multiply height for some reason
                targetY -= (1.5 * parseInt(entityHeight));
            }

            this.Element.style.left = (gridSize * offsetPosition.x) + "px";
            this.Element.style.top = targetY + "px";
        }
    }
}
