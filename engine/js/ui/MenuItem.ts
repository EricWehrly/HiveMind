import Menu from "./menu";
import UIElement, { UIElementOptions, UI_ELEMENT_TYPE } from "./ui-element";

export interface IMenuItem {
    menu: Menu;
    Element?: HTMLElement;
    context?: Record<string, any>;
    name?: string;
    cost?: number;
    characterTypeName?: string;
    section?: string;
}

export default class MenuItem extends UIElement implements IMenuItem {

    private _enabled: boolean;
    private _menu: Menu;
    public get menu() { return this._menu; }

    context: Record<string, any>;
    readonly name: string;
    cost: number;
    characterTypeName: string;

    public get enabled() { return this._enabled; }
    public set enabled(newValue) { this.enabled = newValue; }

    constructor(options: UIElementOptions & IMenuItem) {
        if(!options.parent) {
            if(options.section) {
                options.parent = options.menu.getSection(options.section);
            } else {
                options.parent = options.menu;
            }
        }
        super(options);
        this._menu = options.menu;

        this.context = options.context || {};
        this.name = options.name || options.characterTypeName;
        this.characterTypeName = options.characterTypeName || options.name
        
        if(options.cost) {
            this.cost = options.cost;
        }
        if(options.context?.callback) this.context.callback = options.context.callback.bind(this);

        if(!options.text) {
            this.text = options.name || options.characterTypeName;
        }

        if(!options.customAction && this.elementType == UI_ELEMENT_TYPE.Button) {
            this.customAction = this.menuInteract.bind(this);
        }

        options.menu.addItem(this);
    }

    resolveChild(options: UIElementOptions & IMenuItem): MenuItem {
        options.parent = this;
        for(var child of this.children as MenuItem[]) {
            // TODO: other options
            if(options.name && child.name != options.name) {
                continue;
            }
            if(options.text && child.text != options.text) {
                continue;
            }
            if(options.elementType && options.elementType != child.elementType) {
                continue;
            }

            return child;
        }

        return new MenuItem(options);
    }

    private menuInteract() {
        this.menu.select(this);
        if(this.menu.menuAction) {
            this.menu.menuAction({ menu: this.menu} );
        }
    }
}
