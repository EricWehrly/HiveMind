import { AddCharacterToList } from './characters.mjs';
import { AssignWithUnderscores } from '../util/javascript-extensions.js'

// extends entity?
export default class Character {

    _health = 1;

    get health() {
        return this._health;
    }
    
    set health(newValue) {
        this._health = newValue;
    }

    _position = {
        x: 0,
        y: 0
    }

    _velocity = {
        x: 0,
        y: 0
    }

    // TODO: use speed
    _speed = 1;

    constructor(options = {}) {

        AssignWithUnderscores(this, options);

        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';
        // TODO: Find a better way to have a cancellable default?
        if(options.color === null) delete this.color;
        // options.image

        this.createGraphic();

        AddCharacterToList(this);
    }

    get position() {
        return this._position;
    }

    set position(options) {
        if(options.x) this._position.x = options.x;
        if(options.y) this._position.y = options.y;
    }

    get velocity() {
        return this._velocity;
    }

    set velocity(options) {

        if(typeof options === "string" && options.indexOf(",") > 0) {
            console.log("yes string");
            const split = options.split(",");
            options.x = split[0];
            options.y = split[1];
        }
        if(options.x != null) this._velocity.x = options.x;
        if(options.y != null) this._velocity.y = options.y;
    }

    think() { }

    move(amount) {

        this._position.x += this._velocity.x * this._speed * amount;
        this._position.y += this._velocity.y * this._speed * amount;
    }

    redraw() {

        // TODO: get grid size constant
        const gridSize = 32;

        // TODO: Not this
        const MINIMUM_SIZE = gridSize / 2;

        this.graphic.style.left = (gridSize * this._position.x) + "px";
        this.graphic.style.top = (gridSize * this._position.y) + "px";

        // TODO: Only change on resize ...
        
        let targetSize = (this.health / 100) * gridSize;
        if(targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
        this.graphic.style.width = targetSize + "px";
        this.graphic.style.height = targetSize + "px";
    }

    createGraphic() {
        
        this.graphic = document.createElement('div');
        this.graphic.className = 'character';
        if(this.color) this.graphic.style.backgroundColor = this.color;

        if(this.additionalClasses) this.graphic.className += " " + this.additionalClasses;

        document.body.appendChild(this.graphic);
    }

    getDistance(entity) {
        // TODO: Bounding boxes rather than coordinates
        return Math.abs(this._position.x - entity._position.x)
            + Math.abs(this._position.y - entity._position.y);
    }

    getScreenPosition() {

        // TODO: get grid size constant from css
        const gridSize = 32;
        return {
            x: this.position.x * gridSize,
            y: this.position.y * gridSize
        };
    }
}
