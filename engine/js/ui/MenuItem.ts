import Events from "../events";
import { Defer } from "../loop.mjs";
import Menu from "./menu";
import UIElement, { UIElementOptions } from "./ui-element";

interface IMenuItem {
    menu: Menu;
    menuItemType?: MenuItemType;
    Element?: HTMLElement;
    context?: Record<string, any>;
    name?: string;
    cost?: number;
    characterTypeName?: string;
    section?: string;
}

export enum MenuItemType {
    Default = 'div',
    Label = 'span',
    Checkbox = 'input',
}

export default class MenuItem extends UIElement implements IMenuItem {

    private _enabled: boolean;
    private _menu: Menu;
    public get menu() { return this._menu; }

    get Element() {
        return super.Element;
    }
    set Element(value) {
        super.Element = value;
    }
    context: Record<string, any>;
    name: string;
    cost: number;
    characterTypeName: string;
    menuItemType: MenuItemType;

    public get enabled() { return this._enabled; }
    public set enabled(newValue) { this.enabled = newValue; }

    constructor(options: UIElementOptions & IMenuItem) {
        options.menuItemType = options.menuItemType || MenuItemType.Default;

        if(options.section) {
            options.parent = options.menu.getSection(options.section, true);
        } else {
            options.parent = options.menu.Element;
        }
        super(options);
        this._menu = options.menu;

        this.context = options.context || {};
        this.name = options.name || options.characterTypeName;
        this.characterTypeName = options.characterTypeName || options.name
        this.menuItemType = options.menuItemType || MenuItemType.Default;
        
        if(options.cost) {
            this.cost = options.cost;
        }
        if(options.context?.callback) this.context.callback = options.context.callback.bind(this);
        this.Element.innerHTML = options.name || options.characterTypeName;

        options.menu.addItem(this);
    }

    render() {
        if(this.menuItemType == MenuItemType.Label) {
            this.Element = document.createElement('span');
        } else if(this.menuItemType == MenuItemType.Checkbox) {
            this.Element = document.createElement('input');
            this.Element.setAttribute('type', 'checkbox');
        } else {
            this.Element = document.createElement('div');
        }
        Defer(() => {
            Events.Subscribe(Events.List.DataLoaded, this.miAppendUIElement.bind(this));
        }, 1);
    }

    private miAppendUIElement() {
        this.menu.Element.appendChild(this.Element);
        // this.initialize();
    }
}
