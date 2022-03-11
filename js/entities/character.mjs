import { AddCharacterToList } from './characters.mjs';

// extends entity?
export default class Character {

    _health = 1;

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

        Object.assign(this, options);
        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';
        // options.image

        if(options.position) {
            this._position.x = options.position.x;
            this._position.y = options.position.y;
        }

        if(options.speed) this._speed = options.speed;

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

    move(amount) {

        this._position.x += this._velocity.x * this._speed * amount;
        this._position.y += this._velocity.y * this._speed * amount;
    }

    redraw() {

        // TODO: get grid size constant
        const gridSize = 32;
        this.graphic.style.left = (gridSize * this._position.x) + "px";
        this.graphic.style.top = (gridSize * this._position.y) + "px";
    }

    createGraphic() {
        
        this.graphic = document.createElement('div');
        this.graphic.className = 'player character';
        if(this.color) this.graphic.style.backgroundColor = this.color;

        document.body.appendChild(this.graphic);
    }

    getDistance(entity) {
        return Math.abs(this._position.x - entity._position.x)
            + Math.abs(this._position.y - entity._position.y);
    }
}
