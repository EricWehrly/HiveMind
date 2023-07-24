import UIElement from './ui-element.mjs';

export default class Menu extends UIElement {
    
    static #MENU_LIST_COUNT = 0;
    // Menu class should "be" (extend) Listed, but can't extend 2, so...
    static #MENU_LIST = {}
    static get MENU_LIST() {
        return Menu.#MENU_LIST;
    }

    static Get(name) {
        return Menu.#MENU_LIST[name.toLowerCase()];
    }

    static #addMenu(menu) {
        
        Menu.#MENU_LIST[Menu.#MENU_LIST_COUNT++] = menu;
        Menu.#MENU_LIST[menu.name.toLowerCase()] = menu;
    }

    #name;
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

    // when I become visibile, I want to enable "menu_interact" from Action
    set visible(value) {
        super.visible = value;
        Action.List["menu_interact"].enabled = super.visible;
    }

    // TODO: when the menu is open / visible, need to enable
    // BUILD_ACTION
    // and disable when we lose visible / focus

    // raise events when visible changes, and subscribe to those?

    select(menuItem) {

        // we'd have access to these functions
        // if it was a uiElement instead of a dom element
        const selected = this.Element.querySelector(".selected");
        if(selected) selected.className = selected.className.replace(className, "").trim();

        // the ideal would probably still be for these classes to be enums
        menuItem.Element.className += "selected";
        this.#selected = menuItem;
    }

    constructor(options = {}) {

        super(options);

        this.addClass("menu");

        if(options.name) this.#name = options.name;
        const title = document.createElement('h3');
        title.innerHTML = this.#name;
        this.Element.appendChild(title);

        if(options.menuAction) this.#menuAction = options.menuAction;

        // TODO: for menu items:
        // need button to cycle prev/next menu item
        // action (F) "activates" currently selected menu item

        Menu.#addMenu(this);
    }

    addItem(options) {
        
        this.Element.appendChild(document.createElement('br'));
        
        // should menuItem be a ui element?
        const menuItem = {
            context: {}
        };
        Object.assign(menuItem.context, options);
        menuItem.Element = document.createElement('div');
        menuItem.Element.innerHTML = options.name;
        this.Element.appendChild(menuItem.Element);

        if(!this.#selected) {
            this.select(menuItem);
        }

        // console.log(`Adding item ${options.name} to menu ${this.#name}`);
        // console.log(options);
    }
}
