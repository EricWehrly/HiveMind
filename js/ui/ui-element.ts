import Renderer from '../rendering/renderer';
import Events from '../events';
import Rectangle from '../baseTypes/rectangle';
import Entity from '../entities/character/Entity';
import UI from './ui';

export enum SCREEN_ZONE {
    NONE = "",
    BOTTOM_LEFT = "bottom left",
    BOTTOM_CENTER = "bottom center",
    BOTTOM_RIGHT = "bottom right",
    TOP_LEFT = "top left",
    TOP_CENTER = "top center",
    TOP_RIGHT = "top right",
    MIDDLE_LEFT = "middle left",
    MIDDLE_CENTER = "middle center",
    MIDDLE_RIGHT = "middle right"
};

export interface UIElementOptions {
    parent?: Element;
    screenZone?: SCREEN_ZONE;
    visible?: boolean;
    classes?: string[];
}

export default class UIElement {

    private static _UI_ELEMENTS: UIElement[] = [];
    screenZone;

    static {
        Renderer.RegisterRenderMethod(10, UIElement.#ui_loop);
    }

    static #ui_loop(screenRect: Rectangle) {
    
        for(var element of UIElement._UI_ELEMENTS) {
            element.redraw(screenRect);
        }
    }

    private _initialized = false;
    private _element: HTMLElement;
    private _visible = true
    private _entity: Entity;
    private _initialDisplay = "none";
    private _parent: Element;

    get visible() {
        return this._visible;
    }

    set visible(value) {
        if(this._visible == value) return;
        
        this._visible = value;
        if(this._initialized) {
            if(this._element && this._visible) this._element.style.display = this._initialDisplay;
            if(this._element && !this._visible) this._element.style.display = "none";
        }
    }

    get entity() { return this._entity; }
    set entity(value) { this._entity = value; }

    get Element() { return this._element; }
    set Element(value) { this._element = value; }

    constructor(options: UIElementOptions = {}) {

        this.screenZone = options.screenZone || SCREEN_ZONE.NONE;
        // we had a redundant 'options assign' method .. in entity

        this._parent = options.parent || UI.CONTAINER;
        if(this._parent == null) debugger;

        this.render(options);
        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        for(var uiClass of options?.classes || []) {
            this.addClass(uiClass);
        }
        if('visible' in options) this.visible = options.visible;

        UIElement._UI_ELEMENTS.push(this);
    }

    render(options: UIElementOptions) {
        this._element = document.createElement('div');
        Events.Subscribe(Events.List.DataLoaded, this.appendUIElement.bind(this));
    }

    private appendUIElement() {
        this._parent.appendChild(this.Element);
        this._initialDisplay = window.getComputedStyle(this.Element).display;
        this.initialize();
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

    initialize() {
        if(this._initialized) console.warn("Already initialized.");
        else this._initialized = true;
        // toggle visibility on/off now that we're initialized ...
        this.visible = !this.visible;
        this.visible = !this.visible;
    }
}
