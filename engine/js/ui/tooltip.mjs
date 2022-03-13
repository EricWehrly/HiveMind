// TODO: timeout
export default class Tooltip {

    constructor(options = {}) {

        // TODO: reject if not given required parameters
        const message = options.message || "";
        // screen position, NOT grid position!
        const position = options.position || {x: 0, y: 0};

        this.Element = document.createElement('div');
        this.Element.className = 'ui tooltip';
        this.Element.style.left = position.x + "px";
        this.Element.style.top = position.y + "px";

        document.body.appendChild(this.Element);

        this.Element.innerHTML = message;
    }
}
