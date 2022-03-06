// TODO: Extends character
export default class Player {

    constructor(options = {}) {

        // options.id
        // options.image
        // options.color

        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';

        this._velocity = {
            x: 0,
            y: 0
        };

        this.createGraphic();

        console.debug(`Created player ${this.id}`);
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
        if(options.x) this._velocity.x = options.x;
        if(options.y) this._velocity.y = options.y;
    }

    createGraphic() {
        
        this.graphic = document.createElement('div');
        this.graphic.className = 'player character';
        if(this.color) this.graphic.style.backgroundColor = this.color;

        document.body.appendChild(this.graphic);
    }
}
