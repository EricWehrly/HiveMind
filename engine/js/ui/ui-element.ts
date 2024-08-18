import Events from '../events';
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

export enum UI_ELEMENT_TYPE {
    Default = "div",
    Button = "button",
    Label = "label",
    Checkbox = "input",
}

export interface UIElementOptions {
    text?: string;
    parent?: UIElement;
    screenZone?: SCREEN_ZONE;
    visible?: boolean;
    classes?: string[];
    elementType?: UI_ELEMENT_TYPE;
    customAction?: (event: Event) => void;
    title?: string;
}

Events.List.UIElementUpdated = "UIElementUpdated";
Events.List.UIElementDestroyed = "UIElementDestroyed";

export default class UIElement {

    private static _UI_ELEMENTS: UIElement[] = [];
    public static get UI_ELEMENTS() { return this._UI_ELEMENTS; }
    screenZone;

    private _visible = true
    private _entity: Entity;
    private _text: string;
    private _parent: UIElement;
    private _classes: string[] = [];
    private _elementType: UI_ELEMENT_TYPE = UI_ELEMENT_TYPE.Default;
    // later, we may want to instead track a map of interaction types to responding actions
    // so rather than just click, we can custom double-click, hovver, etc.
    private _customAction: (event: Event) => void;
    private _title: string;

    // there's no need for anyone except the renderer to know this, so far
    get classes() { return this._classes; }

    // TODO: Ideally, we want only the renderer to read the parent
    get parent() { return this._parent; }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        if(this._visible == value) return;
        
        this._visible = value;
        Events.RaiseEvent(Events.List.UIElementUpdated, this);
    }
    get customAction() { return this._customAction; } 
    // ideally 'protected' :/
    set customAction(value) { this._customAction = value; }

    get elementType() { return this._elementType; }
    get text() { return this._text; }
    get entity() { return this._entity; }
    set entity(value) { this._entity = value; }
    get title() { return this._title; }

    constructor(options: UIElementOptions = {}) {

        this.screenZone = options.screenZone || SCREEN_ZONE.NONE;
        // we had a redundant 'options assign' method .. in entity

        this._parent = options.parent;

        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        for(var uiClass of options?.classes || []) {
            this.addClass(uiClass);
        }
        if('visible' in options) this.visible = options.visible;

        if(options.text) this.setText(options.text);
        if(options.title) this._title = options.title;

        if(options.elementType) this._elementType = options.elementType;
        if(options.customAction) this._customAction = options.customAction;

        UIElement._UI_ELEMENTS.push(this);
    }

    addClass(className: string) {
        if(!this._classes.includes(className)) {
            this._classes.push(className);
        }
        Events.RaiseEvent(Events.List.UIElementUpdated, this);
    }
    
    removeClass(className: string) {
        this._classes = this._classes.filter(clazz => clazz != className);
        Events.RaiseEvent(Events.List.UIElementUpdated, this);
    }

    toggleClass(className: string) {

        if(this._classes.includes(className)) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }
    }

    setText(text: string) {
        this._text = text;
        Events.RaiseEvent(Events.List.UIElementUpdated, this);
    }

    destroy() {
        Events.RaiseEvent(Events.List.UIElementDestroyed, this);
        UIElement._UI_ELEMENTS.splice(UIElement._UI_ELEMENTS.indexOf(this), 1);
    }
}
