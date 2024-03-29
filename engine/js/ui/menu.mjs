import UIElement from './ui-element.mjs';
import Events from '../events.mjs';
import Action from '../action.mjs';

Events.List.MenuOpened = "MenuOpened";
Events.List.MenuClosed = "MenuClosed";

export default class Menu extends UIElement {
    
    static #isAnyMenuOpen = false;
    static #MENU_LIST_COUNT = 0;
    // Menu class should "be" (extend) Listed, but can't extend 2, so...
    static #MENU_LIST = {}
    static get MENU_LIST() {
        return Menu.#MENU_LIST;
    }

    static #current = null;
    static get Current() {
        return Menu.#current;
    }

    static Get(name) {
        return Menu.#MENU_LIST[name.toLowerCase()];
    }

    static #addMenu(menu) {
        
        Menu.#MENU_LIST[Menu.#MENU_LIST_COUNT++] = menu;
        Menu.#MENU_LIST[menu.name.toLowerCase()] = menu;
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
    #items = [];
    #selected;
    #menuAction;

    get name() {
        return this.#name;
    }

    get selected() {
        return this.#selected;
    }

    get menuAction() {
        return this.#menuAction;
    }

    get visible() {
        return super.visible;
    }

    get items() { return this.#items; }

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

    #collapsed;
    get collapsed() { return this.#collapsed; }
    set collapsed(newValue) {
        this.#collapsed = newValue;
        if(this.#collapsed) this.addClass("collapse");
        else this.removeClass("collapse");
    }

    // TODO: when the menu is open / visible, need to enable
    // BUILD_ACTION
    // and disable when we lose visible / focus

    // raise events when visible changes, and subscribe to those?

    select(menuItem) {

        // we'd have access to these functions
        // if it was a uiElement instead of a dom element
        const selected = this.Element.querySelector(".selected");
        if(selected) selected.className = selected.className.replace("selected", "").trim();

        // the ideal would probably still be for these classes to be enums
        menuItem.Element.className += " selected";
        this.#selected = menuItem;
    }

    selectNext() {

        if(this.#items.length < 2) return;

        const selectedIndex = this.#items.indexOf(this.selected);
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

    constructor(options = {}) {

        super(options);

        this.addClass("menu");
        this.addClass(options.name);

        if(options.vertical) this.addClass("vertical");

        if(options.name) this.#name = options.name;
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
            this.collapse = document.createElement("span");
            this.collapse.className = "collapse-handler";
            this.Element.appendChild(this.collapse);
            this.Element.addEventListener("click", this.collapseClicked.bind(this), false); //where func is your function name
        }

        Menu.#addMenu(this);
    }

    collapseClicked() {

        this.collapsed = !this.collapsed;
        Menu.#computeAnyMenuOpen();
    }

    addItem(options) {
        
        // should menuItem be a ui element?
        let menuItem = {
            context: {},
            name: options.name
        };
        if(options.cost) {
            menuItem.cost = options.cost;
            delete options.cost;
        }
        Object.assign(menuItem.context, options);
        if(menuItem.context.callback) menuItem.context.callback = menuItem.context.callback.bind(menuItem);
        menuItem.Element = document.createElement('div');
        menuItem.Element.innerHTML = options.name;
        this.#addToDom(menuItem.Element, options);

        if(!this.#selected) {
            this.select(menuItem);
        }

        this.#items.push(menuItem);

        return menuItem;
    }

    addLabel(options) {
        
        // should menuItem be a ui element?
        const menuItem = {
            context: {}
        };
        Object.assign(menuItem.context, options);
        menuItem.Element = document.createElement('span');
        menuItem.Element.innerHTML = options.name;
        this.#addToDom(menuItem.Element, options);

        return menuItem;
    }

    removeItem(item) {

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

    getSection(name, addIfMissing = false) {

        if(!name) return this.Element;

        let section = this.Element.getElementsByClassName(`section ${name}`);
        if(section.length > 0) return section[0];

        else if(addIfMissing) {
            return this.addSection(name);
        }

        return this.Element;
    }

    // TODO: section header
    addSection(name) {
        
        const section = document.createElement('div');
        section.className = `section ${name}`;
        this.Element.appendChild(section);

        return section;
    }

    #addToDom(element, options) {

        if(options.section) {

            const section = this.getSection(options.section, true);
            section.appendChild(element);
        } else {
            this.Element.appendChild(element);
        }
    }
}

if(window) window.Menu = Menu;
