import UIElement, { UIElementOptions } from './ui-element';
import Events from '../events';
import Action from '../action';
import MenuItem from './MenuItem';

Events.List.MenuOpened = "MenuOpened";
Events.List.MenuClosed = "MenuClosed";

export interface MenuOptions {
    name?: string;
    vertical?: boolean;
    collapsible?: boolean;
    collapsed?: boolean;
    menuAction?: (arg: MenuAction) => void;
    canBeClosed?: boolean;
    icon?: UIElementOptions;
}

export interface MenuAction {
    menu: Menu;
}

export default class Menu extends UIElement {
    
    static #isAnyMenuOpen = false;
    // Menu class should "be" (extend) Listed, but can't extend 2, so...
    static #MENU_LIST: Map<String, Menu> = new Map();
    canBeClosed: any;
    static get MENU_LIST() { return Menu.#MENU_LIST; }

    static #current: Menu = null;
    static get Current() { return Menu.#current; }

    static Get(name: string) {
        return Menu.#MENU_LIST.get(name.toLowerCase());
    }

    static #addMenu(menu: Menu) {
        
        Menu.#MENU_LIST.set(menu.name.toLowerCase(), menu);
    }

    static get anyOpen() {

        return Menu.#isAnyMenuOpen;
    }

    static #computeAnyMenuOpen() {

        let visibleMenus = Object.values(Menu.#MENU_LIST);
        visibleMenus = visibleMenus.filter(x => x.visible && x.collapsed != true);
        Menu.#isAnyMenuOpen = visibleMenus.length > 0;
    }

    #name;
    #items: MenuItem[] = [];
    _selected: MenuItem;
    #menuAction;
    _collapsed: boolean;
    _collapsible: boolean;
    private _icon: UIElement;
    private _sections = new Map<string, UIElement>();
    get name() { return this.#name; }
    get selected() { return this._selected; }
    get menuAction() { return this.#menuAction; }
    get visible() { return super.visible; }
    get items() { return this.#items; }
    get collapsed() { return this._collapsed; }
    get collapsible() { return this._collapsible; }
    get sections() { return this._sections; }

    // when I become visibile, I want to enable "menu_interact" from Action
    set visible(value) {
        super.visible = value;
        Action.List["menu_interact"].enabled = super.visible;

        Menu.#computeAnyMenuOpen();

        if(this.visible) {
            Menu.#current = this;
            Events.RaiseEvent(Events.List.MenuOpened, this);
        }
        else {
            if(Menu.#current == this) Menu.#current = null;
            Events.RaiseEvent(Events.List.MenuClosed, this);
        }
    }

    set collapsed(newValue) {
        this._collapsed = newValue;
        if(this._collapsed) this.addClass("collapse");
        else this.removeClass("collapse");
    }

    // TODO: when the menu is open / visible, need to enable
    // BUILD_ACTION
    // and disable when we lose visible / focus

    // raise events when visible changes, and subscribe to those?

    select(menuItem: MenuItem) {

        if(this._selected == menuItem) return;
        if(this._selected) this._selected.removeClass("selected");
        this._selected = menuItem;
        menuItem.addClass("selected");
    }

    selectNext() {

        if(this.#items.length < 2) return;

        const selectedIndex = this.#items.findIndex(item => item === this.selected);
        if(this.#items.length - 1 > selectedIndex) {
            this.select(this.#items[selectedIndex + 1]);
        } else {
            this.select(this.#items[0]);
        }
    }

    selectPrevious() {

        if(this.#items.length < 2) return;

        const selectedIndex = this.#items.indexOf(this.selected);
        if(selectedIndex - 1 > -1) {
            this.select(this.#items[selectedIndex - 1]);
        } else {
            this.select(this.#items[this.#items.length - 1]);
        }
    }

    constructor(options: MenuOptions & UIElementOptions = {}) {

        options.title = options.name;
        options.visible = options.visible || false;     // new menus are hidden by default, unlike ui elements

        super(options);

        this.addClass("menu");

        if(options.vertical) this.addClass("vertical");

        if(options.name) {
            this.#name = options.name;
            this.addClass(options.name);
        }

        if(options.menuAction) this.#menuAction = options.menuAction;

        this._collapsed = options.collapsed;
        this._collapsible = options.collapsed || options.collapsible;        
        if (this._collapsible) this.addClass("collapsible");

        if(options.icon) {
            this._icon = new UIElement(options.icon);
            this._icon.addClasses(["icon", this.name]);
            this._icon.customAction = this.toggle.bind(this);
        }

        if(options.canBeClosed == true || options.canBeClosed == undefined) this.canBeClosed = true;

        Menu.#addMenu(this);
    }

    toggleCollapsed() {

        this.collapsed = !this.collapsed;
        Menu.#computeAnyMenuOpen();
    }

    addItem(menuItem: MenuItem) {
        
        if(!this._selected) {
            this.select(menuItem);
        }

        this.#items.push(menuItem);
    }

    removeItem(item: MenuItem) {

        item.destroy();
        const index = this.#items.indexOf(item);
        if(index > -1) {
            this.#items.splice(index, 1);
        }
    }

    getSection(name: string): UIElement {

        if(!this._sections.has(name)) {
            this._sections.set(name, this.addSection(name));
        }
        return this._sections.get(name);
    }

    // TODO: section header
    addSection(name: string): UIElement {
        
        const section = new UIElement({
            classes: ["section", name],
            parent: this,
            // title: name
        });

        return section;
    }

    open() {
        this.visible = true;
    }

    close() {
        this.visible = false;
    }

    toggle() {
        console.log('togle');
        this.visible = !this.visible;
    }
}

if(window) window.Menu = Menu;
