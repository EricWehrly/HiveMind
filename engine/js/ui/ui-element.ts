import Renderer from '../rendering/renderer.mjs';
import Events from '../events';
import Rectangle from '../baseTypes/rectangle';
import Entity from '../entities/character/Entity';

export interface UIElementOptions {
    screenZone?: any;
    visible?: boolean;
    classes?: string[];
}

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

    static #UI_ELEMENTS: UIElement[] = [];
    static #initialDisplay = "none";
    screenZone;

    static {
        Renderer.RegisterRenderMethod(10, UIElement.#ui_loop);
    }

    static #ui_loop(screenRect: Rectangle) {
    
        for(var element of UIElement.#UI_ELEMENTS) {
            element.redraw(screenRect);
        }
    }

    private _element;
    private _visible = true
    private _entity: Entity;

    get visible() {
        return this._visible;
    }

    set visible(value) {
        if(this._visible == value) return;
        
        this._visible = value;
        if(this._element && this._visible) this._element.style.display = UIElement.#initialDisplay;
        if(this._element && !this._visible) this._element.style.display = "none";
    }

    get entity() { return this._entity; }
    set entity(value) { this._entity = value; }

    get Element() { return this._element; }

    constructor(options: UIElementOptions = {}) {

        this.screenZone = options.screenZone || UIElement.SCREEN_ZONE.NONE;
        // we had a redundant 'options assign' method .. in entity

        this._element = document.createElement('div');
        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        for(var uiClass of options?.classes || []) {
            this.addClass(uiClass);
        }
        UIElement.#initialDisplay = this._element.style.display;
        if('visible' in options) this.visible = options.visible;

        UIElement.#UI_ELEMENTS.push(this);

        const that = this;
        Events.Subscribe(Events.List.GameStart, function appendUIElement() {
            document.getElementById("ui-container").appendChild(that._element);
        });
    }

    addClass(className: string) {
        this._element.className += ` ${className}`;
    }
    
    removeClass(className: string) {
        this._element.className = this._element.className.replace(className, "").trim();
    }

    toggleClass(className: string) {

        if(this._element.className.indexOf(className) > -1) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }
    }

    setText(text: string) {

        let span = this._element.getElementsByTagName('span')[0] || null;
        if(!span) {
            span = document.createElement('span');
            this._element.appendChild(span);
        }

        span.innerHTML = text;
    }

    redraw(screenRect: Rectangle) {
        
        // TODO: fix this later
        // @ts-expect-error
        const entityGraphic = this?.entity?.graphic;

        if(entityGraphic) {

            // TODO: get grid size constant
            const gridSize = 32;

            const entityHeight = entityGraphic.offsetHeight;
            const offsetPosition = {
                x: this._entity.position.x - screenRect.x,
                y: this._entity.position.y - screenRect.y
            };
            let targetY = gridSize * offsetPosition.y;
            if(entityGraphic?.style?.height) {
                // multiply height for some reason
                targetY -= (1.5 * parseInt(entityHeight));
            }

            this._element.style.left = (gridSize * offsetPosition.x) + "px";
            this._element.style.top = targetY + "px";
        }
    }
}