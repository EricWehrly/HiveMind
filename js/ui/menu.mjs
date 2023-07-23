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
}
