import { AddCharacterToList, RemoveCharacterFromList } from './characters.mjs';
import { AssignWithUnderscores } from '../util/javascript-extensions.js'
import Point from '../baseTypes/point.mjs';
import Technology from '../technology.mjs';
import Equipment from './equipment.mjs';
import BasicAI from '../ai/basic.mjs';

// extends entity?
export default class Character {

    _health = 1;

    get health() {
        return this._health;
    }

    set health(newValue) {
        this._health = newValue;
        if (this._health <= 0) this.die();
    }

    _position = new Point(0, 0);

    _velocity = {
        x: 0,
        y: 0
    }

    // TODO: use speed
    _speed = 1;

    _technologies = [];

    _equipment = new Equipment(this);

    _target = null;

    constructor(options = {}) {

        AssignWithUnderscores(this, options);

        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;
        // options.image

        // TODO: let's default to no AI at all unless prescribed ...
        this.setupAI();

        this.createGraphic();

        AddCharacterToList(this);
    }

    get position() {
        return this._position;
    }

    set position(options) {
        if (options.x) this._position.x = options.x;
        if (options.y) this._position.y = options.y;
    }

    get velocity() {
        return this._velocity;
    }

    set velocity(options) {

        if (typeof options === "string" && options.indexOf(",") > 0) {
            console.log("yes string");
            const split = options.split(",");
            options.x = split[0];
            options.y = split[1];
        }
        if (options.x != null) this._velocity.x = options.x;
        if (options.y != null) this._velocity.y = options.y;
    }

    get technologies() {
        return this._technologies;
    }

    get equipment() {
        return this._equipment;
    }

    get target() {
        return this._target;
    }

    set target(newValue) {
        if (newValue == null || newValue == undefined) return;
        console.log(`New target for ${this.name}!`);
        this._target = newValue;
    }

    get isAlive() {
        return !this.dead && (this.isPlayer || this.ai != null);
    }

    get isHostile() {

        return this.isPlayer || this.hasEquipped(Technology.Types.ATTACK);
    }

    hasTechnology(technology) {

        if (typeof technology == "string") {
            technology = Technology.Get(technology);
        } // else warn?
        return this._technologies.includes(technology);
    }

    AddTechnology(technology) {
        technology = Technology.Get(technology);
        console.log(`Adding technology ${technology.name} to character ${this.name}`);
        this._technologies.push(technology);

        if (!this.hasEquipped(technology.type)) {
            this.equip(technology);
        }

        console.log(`${technology.type} equipped: ${this.getEquipped(technology.type).name}`);
    }

    think() {
        // TODO: Use range of equipped attack?
        if (!this.target || !this.target.isAlive) this.target = this.getClosestEntity({ distance: 10 });

        if (this.ai) this.ai.think();
    }

    // player character is moving to target and shouldn't be
    moveToTarget() {

        if (this.target) {
            if (this.position.x != this.target.position.x
                || this.position.y != this.target.position.y) {
                if (this.position.x < this.target.position.x) this._velocity.x = 1;
                else if (this.position.x > this.target.position.x) this._velocity.x = -1;
                if (this.position.y < this.target.position.y) this._velocity.y = 1;
                else if (this.position.y > this.target.position.y) this._velocity.y = -1;
            }
        }
    }

    shouldMoveToTarget() {
        return this.ai != null && this.target != null;
    }

    shouldStopOnAxis(axis, amount) {
        return Math.abs(this._position[axis] - this.target.position[axis]) < this._speed * amount;
    }

    atTarget(axis) {
        return this.target && this.target.position[axis] == this._position[axis];
    }

    move(amount) {

        if (this.shouldMoveToTarget()) {
            for (var axis of ['x', 'y']) {
                if (!this.atTarget(axis)) {
                    if (this.shouldStopOnAxis(axis, amount)) {
                        this._position[axis] = this.target.position[axis];
                        this._velocity[axis] = 0;
                    } else {
                        this._position[axis] += this._velocity[axis] * this._speed * amount;
                    }
                }
            }
        } else {
            this._position.x += this._velocity.x * this._speed * amount;
            this._position.y += this._velocity.y * this._speed * amount;
        }
    }

    redraw() {

        // TODO: get grid size constant
        const gridSize = 32;

        // TODO: Not this
        const MINIMUM_SIZE = gridSize / 2;

        // maybe the playfield should move and the player should stay centered ...
        this.graphic.style.left = (gridSize * this._position.x) + "px";
        this.graphic.style.top = (gridSize * this._position.y) + "px";

        // TODO: Only change on resize ...

        let targetSize = (this.health / 100) * gridSize;
        if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
        this.graphic.style.width = targetSize + "px";
        this.graphic.style.height = targetSize + "px";
    }

    createGraphic() {

        this.graphic = document.createElement('div');
        this.graphic.className = 'character';
        // if(this.color) this.graphic.style.backgroundColor = this.color;
        if (this.color) this.graphic.className += ` ${this.color}`;
        if (this.isAlive) this.graphic.className += ' alive';

        if (this.additionalClasses) this.graphic.className += " " + this.additionalClasses;

        // TODO: This playfield reference should probably be stored somewhere more globally referencable
        document.getElementById("playfield").appendChild(this.graphic);
    }

    setupAI() {
        // TODO: Allow config from options
        if (this.ai === undefined) this.ai = new BasicAI(this);
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

    // TODO: Need to prioritize close hostile entities over closer non-hostile
    getClosestEntity(options = {
        distance: 100,
        filterChildren: true,
        hostile: null
    }) {

        let closest = {
            entity: null,
            distance: options.distance
        };
        for (var character of CHARACTER_LIST) {
            if (character != this) {
                if (options.filterChildren && character.parent == this) {
                    continue;
                }
                if (options.hostile != null && character.isHostile != options.hostile) {
                    continue;
                }
                const distance = character.getDistance(this);
                if (distance < closest.distance) {
                    closest.distance = distance;
                    closest.entity = character;
                }
            }
        }

        return closest.entity;
    }

    // private?
    // TODO: Should we just flag not alive and defer 'fading out' corpse?
    die() {
        this.dead = true;
        document.getElementById("playfield").removeChild(this.graphic);
        RemoveCharacterFromList(this);
    }
}
