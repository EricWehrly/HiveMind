import Events, { GameEvent } from '../events';
import Entity from '../entities/character/Entity';
import { generateId } from '../util/javascript-extensions.mjs';

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
    collapsible?: boolean;
    collapsed?: boolean;
}

Events.List.UIElementUpdated = "UIElementUpdated";
Events.List.UIElementDestroyed = "UIElementDestroyed";

export interface UIElementEvent extends GameEvent {
    uiElement: UIElement;
}

export default class UIElement {

    private static _UI_ELEMENTS: UIElement[] = [];
    public static get UI_ELEMENTS() { return this._UI_ELEMENTS; }
    screenZone;

    private _id: string;
    private _visible = true
    private _entity: Entity;
    private _text: string;
    private _parent: UIElement;
    // ideally protected
    private _children: UIElement[] = [];
    private _classes: string[] = [];
    private _elementType: UI_ELEMENT_TYPE = UI_ELEMENT_TYPE.Default;
    // later, we may want to instead track a map of interaction types to responding actions
    // so rather than just click, we can custom double-click, hovver, etc.
    private _customAction: (event: Event) => void;
    private _title: string;
    private _collapsible: boolean;
    private _collapsed: boolean;

    // there's no need for anyone except the renderer to know this, so far
    get classes() { return this._classes; }

    // TODO: Ideally, we want only the renderer to read the parent
    get parent() { return this._parent; }
    get children() { return this._children; }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        if(this._visible == value) return;
        
        this._visible = value;
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementUpdated, uiEvent);
    }
    get customAction() { return this._customAction; } 
    // ideally 'protected' :/
    set customAction(value) { this._customAction = value; }

    get id() { return this._id; }
    get elementType() { return this._elementType; }
    get text() { return this._text; }
    get entity() { return this._entity; }
    set entity(value) { this._entity = value; }
    get title() { return this._title; }
    get collapsible() { return this._collapsible; }
    get collapsed() { return this._collapsed; }

    set collapsed(newValue: boolean) {
        this._collapsed = newValue;
        console.log('toggle class')
        if(this._collapsed) this.addClass("collapse");
        else this.removeClass("collapse");
    }

    set text(value) {
        this._text = value;
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementUpdated, uiEvent);
    }

    constructor(options: UIElementOptions = {}) {

        this._id = generateId();

        this.screenZone = options.screenZone || SCREEN_ZONE.NONE;
        // we had a redundant 'options assign' method .. in entity

        this._parent = options.parent;
        if(this._parent) {
            this.parent.addChild(this);
        }

        this.addClass("ui");
        // if it doesn't have a follow entity...
        this.addClass(this.screenZone);
        for(var uiClass of options?.classes || []) {
            this.addClass(uiClass);
        }
        if('visible' in options) this.visible = options.visible;

        if(options.text) this.text = options.text;
        if(options.title) this._title = options.title;
        this._collapsible = options.collapsed || options.collapsible || false;
        this._collapsed = options.collapsed || false;
        if (this._collapsible) this.addClass("collapsible");

        if(options.elementType) this._elementType = options.elementType;
        if(options.customAction) this._customAction = options.customAction;

        UIElement._UI_ELEMENTS.push(this);
    }

    addClass(className: string) {
        if(!this._classes.includes(className)) {
            this._classes.push(className);
        }
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementUpdated, uiEvent);
    }

    addClasses(classNames: string[]) {
        for(var className of classNames) {
            this.addClass(className);
        }
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementUpdated, uiEvent);
    }
    
    removeClass(className: string) {
        this._classes = this._classes.filter(clazz => clazz != className);
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementUpdated, uiEvent);
    }

    toggleClass(className: string) {

        if(this._classes.includes(className)) {
            this.removeClass(className);
        } else {
            this.addClass(className);
        }
    }

    addChild(child: UIElement) {

        this._children.push(child);
    }

    toggleCollapsed() {
        this.collapsed = !this._collapsed;
    }

    destroy() {
        const uiEvent: UIElementEvent = { uiElement: this };
        this.RaiseUIElementEvent(Events.List.UIElementDestroyed, uiEvent);
        UIElement._UI_ELEMENTS.splice(UIElement._UI_ELEMENTS.indexOf(this), 1);
    }

    private RaiseUIElementEvent(eventName: string, uiElementEvent: UIElementEvent) {
        Events.RaiseEvent(eventName, uiElementEvent);
    }
}
