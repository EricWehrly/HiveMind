export default class Player {

    constructor(options = {}) {

        // options.id
        // options.image
        // options.color

        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';

        this.createGraphic();

        console.debug(`Created player ${this.id}`);
    }

    createGraphic() {
        
        this.graphic = document.createElement('div');
        this.graphic.className = 'player character';
        if(this.color) this.graphic.style.backgroundColor = this.color;

        document.body.appendChild(this.graphic);
    }
}
