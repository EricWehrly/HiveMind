import Action from '../action.mjs';
import UIElement from './ui-element.mjs';

const MENU_INTERACT_ACTION = new Action({
    name: 'menu_interact',
    enabled: true,
    oncePerPress: true,
    delay: 1000,
    callback: function(options) {

        // ok ... how do we know which menu is in context? 
        // for now we can just assume only 1 menu ...
        const currentMenu = Menu.MENU_LIST[0];
        const selected = currentMenu.selected;
        // do the action, for the selected item ...
        // the action should be "build", but how do we know that?
        // console.log(selected);
        currentMenu.menuAction();
    }
});

export default class Menu extends UIElement {
    
    static #MENU_LIST = []
    static get MENU_LIST() {
        return Menu.#MENU_LIST;
    }

    #name;
    #selected;
    #menuAction;

    get selected() {
        return this.#selected;
    }

    get menuAction() {
        return this.#menuAction;
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

        Menu.#MENU_LIST.push(this);
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
