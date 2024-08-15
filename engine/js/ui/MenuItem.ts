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
    Default,
    Label,
    Checkbox
}

export default class MenuItem extends UIElement implements IMenuItem {

    private _enabled: boolean;
    private _menu: Menu;
    public get menu() { return this._menu; }
    private _labelElement: HTMLElement;

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
        this.menuItemType = options.menuItemType || MenuItemType.Default;
        this._menu = options.menu;

        this.context = options.context || {};
        this.name = options.name || options.characterTypeName;
        this.characterTypeName = options.characterTypeName || options.name
        
        if(options.cost) {
            this.cost = options.cost;
        }
        if(options.context?.callback) this.context.callback = options.context.callback.bind(this);
        this.Element.innerHTML = options.name || options.characterTypeName;

        options.menu.addItem(this);
    }

    render(options: UIElementOptions & IMenuItem) {
        if(options.menuItemType == MenuItemType.Label) {
            this.Element = document.createElement('span');
        } else if(options.menuItemType == MenuItemType.Checkbox) {
            this._labelElement = document.createElement('label');
            this._labelElement.innerHTML = options.name;
            this.Element = document.createElement('input');
            this.Element.setAttribute('type', 'checkbox');

            if(options.context.action) {
                // need to bind 'this'?
                this.Element.addEventListener('change', options.context.action);
            }
        } else {
            this.Element = document.createElement('button');
            if(options.menu.menuAction) {
                // TODO: touch inputs? we probly need to generalize "addEventListener" ...
                this.Element.addEventListener('click', this.menuInteract.bind(this));
            }
        }
        const that = this;
        Defer(() => {
            Events.Subscribe(Events.List.DataLoaded, that.appendMenuItem.bind(that));
        }, 1);
    }

    private appendMenuItem() {
        if(this.menuItemType == MenuItemType.Checkbox) {
            this._labelElement.appendChild(this.Element);
            this.menu.Element.appendChild(this._labelElement);
        } else {
            this.menu.Element.appendChild(this.Element);
            // this.initialize();
        }
    }

    private menuInteract() {
        this.menu.select(this);
        if(this.menu.menuAction) {
            this.menu.menuAction({ menu: this.menu} );
        }
    }
}
