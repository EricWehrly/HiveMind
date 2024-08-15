import UIElement, { SCREEN_ZONE, UIElementOptions } from './ui-element';
import Events from '../events';
import Action from '../action';
import UI from './ui';
import MenuItem from './MenuItem';

Events.List.MenuOpened = "MenuOpened";
Events.List.MenuClosed = "MenuClosed";

export interface MenuOptions {
    name?: string;
    vertical?: boolean;
    collapsible?: boolean;
    collapsed?: boolean;
    menuAction?: (arg: MenuAction) => void;
    icon?: string;
    iconPosition?: SCREEN_ZONE;
    closeButton?: boolean;
}

export interface MenuAction {
    menu: Menu;
}

export default class Menu extends UIElement {
    
    static #isAnyMenuOpen = false;
    // Menu class should "be" (extend) Listed, but can't extend 2, so...
    static #MENU_LIST: Map<String, Menu> = new Map();
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
    #selected: MenuItem;
    #menuAction;
    #collapsed: boolean;
    private _collapseHandle: HTMLElement;
    private _iconHandle: HTMLElement;
    get name() { return this.#name; }
    get selected() { return this.#selected; }
    get menuAction() { return this.#menuAction; }
    get visible() { return super.visible; }
    get items() { return this.#items; }
    get collapsed() { return this.#collapsed; }

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
        this.#collapsed = newValue;
        if(this.#collapsed) this.addClass("collapse");
        else this.removeClass("collapse");
    }

    // TODO: when the menu is open / visible, need to enable
    // BUILD_ACTION
    // and disable when we lose visible / focus

    // raise events when visible changes, and subscribe to those?

    select(menuItem: MenuItem) {

        // we'd have access to these functions
        // if it was a uiElement instead of a dom element
        const selected = this.Element.querySelector(".selected");
        if(selected) selected.classList.remove("selected");

        // the ideal would probably still be for these classes to be enums
        menuItem.Element.classList.add("selected");
        this.#selected = menuItem;
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

        options.visible = options.visible || false;     // new menus are hidden by default, unlike ui elements

        super(options);

        this.addClass("menu");

        if(options.vertical) this.addClass("vertical");

        if(options.name) {
            this.#name = options.name;
            this.addClass(options.name);
        }
        const title = document.createElement('h3');
        title.innerHTML = this.#name;
        this.Element.appendChild(title);

        if(options.menuAction) this.#menuAction = options.menuAction;

        if(options.collapsed) {
            options.collapsible = true;
            this.collapsed = true;
        }

        // TODO: Handle input situations without mouse
        if(options.collapsible) {
            this._collapseHandle = document.createElement("span");
            this._collapseHandle.className = "collapse-handler";
            this.Element.appendChild(this._collapseHandle);
            this.Element.addEventListener("click", this.collapseClicked.bind(this), false);
        }

        if(options.iconPosition) {
            this._iconHandle = document.createElement("div");
            this._iconHandle.className = `ui ${this.name} menu icon ${options.iconPosition}`;
            if(options.icon) this._iconHandle.innerHTML = options.icon;

            this._iconHandle.addEventListener("click", this.toggle.bind(this));
            Events.Subscribe(Events.List.DataLoaded, this.addIconToDom.bind(this));
        }

        if(options.closeButton == true || options.closeButton == undefined) {
            const closeButton = document.createElement("span");
            closeButton.className = "ui close";
            closeButton.innerHTML = "X";
            closeButton.addEventListener("click", this.close.bind(this), false);
            this.Element.appendChild(closeButton);
        }

        Menu.#addMenu(this);
    }

    private addIconToDom() {
        UI.CONTAINER.appendChild(this._iconHandle);
    }

    collapseClicked() {

        this.collapsed = !this.collapsed;
        Menu.#computeAnyMenuOpen();
    }

    addItem(menuItem: MenuItem) {
        
        if(!this.#selected) {
            this.select(menuItem);
        }

        this.#items.push(menuItem);
    }

    removeItem(item: MenuItem) {

        if(item?.Element == null) {
            console.warn("Invalid item for removal.");
            debugger;
            return;
        }

        item.Element.remove();
        const index = this.#items.indexOf(item);
        if(index > -1) {
            this.#items.splice(index, 1);
        }
    }

    getSection(name: string, addIfMissing = false): Element {

        if(!name) return this.Element;

        let section = this.Element.getElementsByClassName(`section ${name}`);
        if(section.length > 0) return section[0];

        else if(addIfMissing) {
            return this.addSection(name);
        }

        return this.Element;
    }

    // TODO: section header
    addSection(name: string): Element {
        
        const section = document.createElement('div');
        section.className = `section ${name}`;
        this.Element.appendChild(section);

        return section;
    }

    open() {
        this.visible = true;
    }

    close() {
        this.visible = false;
    }

    toggle() {
        this.visible = !this.visible;
    }
}

if(window) window.Menu = Menu;
