// draw the tooltip wherever the player is (by default)

export default class Tooltip {

    static Element;

    static {

        this.Element = document.createElement('div');
        this.Element.className = 'tooltip';

        document.body.appendChild(this.Element);
    }

    constructor(message) {
        Tooltip.Element.innerHTML = message;
    }

    static test = function(message) {
        console.log(`Test: ${message}`);
    }
}
