import UIElement from './ui-element.mjs';

export default class Menu extends UIElement {

    #name;

    constructor(options = {}) {

        super(options);

        this.addClass("menu");

        if(options.name) this.#name = options.name;
        const title = document.createElement('h3');
        title.innerHTML = this.#name;
        this.Element.appendChild(title);
    }

    addItem(options) {
        
        const menuItem = document.createElement('div');
        menuItem.innerHTML = options.name;
        this.Element.appendChild(menuItem);

        // console.log(`Adding item ${options.name} to menu ${this.#name}`);
        // console.log(options);
    }
}
