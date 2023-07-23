import UIElement from './ui-element.mjs';

export default class Menu extends UIElement {

    #name;
    #selected;

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

        // TODO: for menu items:
        // need button to cycle prev/next menu item
        // action (F) "activates" currently selected menu item
    }

    addItem(options) {
        
        this.Element.appendChild(document.createElement('br'));
        
        // should menuItem be a ui element?
        const menuItem = {};
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
