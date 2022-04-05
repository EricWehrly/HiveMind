import { AddCharacterToList, RemoveCharacterFromList } from './characters.mjs';
import { AssignWithUnderscores } from '../util/javascript-extensions.js'
import Point from '../baseTypes/point.mjs';
import Technology from '../technology.mjs';
import Equipment from './equipment.mjs';
import BasicAI from '../ai/basic.mjs';
import Events from '../events.mjs';
import './character-graphics.mjs';

Events.List.CharacterCreated = "CharacterCreated";
Events.List.CharacterDied = "CharacterDied";
Events.List.CharacterTargetChanged = "CharacterTargetChanged";

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

    #spawnPosition = {};
    #initialHealth;

    _target = null;

    #maxWanderDistance = 10

    constructor(options = {}) {

        AssignWithUnderscores(this, options);

        this.id = options.id || crypto.randomUUID();
        this.color = options.color || 'red';
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;
        // options.image
        this.#spawnPosition = new Point(this.position.x, this.position.y);
        this.#initialHealth = JSON.parse(JSON.stringify(this.health));

        // TODO: let's default to no AI at all unless prescribed ...
        this.setupAI();

        AddCharacterToList(this);

        Events.RaiseEvent(Events.List.CharacterCreated, this);
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

    get dead() {
        return this._health <= 0;
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
        if (newValue === undefined || newValue == this._target) return;

        if(newValue == this._target) return;
        var oldValue = this._target;

        if(newValue instanceof Point) {
            this._target = {
                position: newValue
            }
        } else this._target = newValue;

        Events.RaiseEvent(Events.List.CharacterTargetChanged, {
            character: this,
            from: oldValue,
            to: this._target
        });
        console.log(`New target for ${this.name}: ${this?.target?.position?.x}, ${this?.target?.position?.y}`);
    }

    get isAlive() {
        return !this.dead && (this.isPlayer || this.ai != null);
    }

    get isHostile() {

        return this.isPlayer || this.hasEquipped(Technology.Types.ATTACK);
    }

    get spawnPosition() {
        return this.#spawnPosition;
    }

    get maxWanderDistance() {
        return this.#maxWanderDistance;
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

        if(technology.type) {
            if (!this.hasEquipped(technology.type)) {
                this.equip(technology);
            }

            console.log(`${technology.type} equipped: ${this.getEquipped(technology.type).name}`);
        }
    }

    shouldStopTargeting(distance = 6) {

        return this.target
            && (this.target.isAlive == false || 
                this.target.getDistance(this) > distance);
    }

    think() {
        if (this.ai) this.ai.think();
        else if(this.isPlayer) {

            // for now just target the closest thing. get more complicated later
            let dist = 5;
            const attack = this.getEquipped(Technology.Types.ATTACK);
            if(attack && attack.range) dist = attack.range;
            this.target = this.getClosestEntity({ distance: dist, filterChildren: true });

            /*
            if(this.shouldStopTargeting()) {
                this.target = null;
            }
            // TODO: Use range of equipped attack?
            if (!this.target || !this.target.isAlive) {
                this.target = this.getClosestEntity({ distance: 5 });
            }
            */
        }
    }

    // player character is moving to target and shouldn't be
    pointAtTarget() {

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
        console.log(`${this.name} is dead now.`);
        document.getElementById("playfield").removeChild(this.graphic);
        RemoveCharacterFromList(this);
    }
}
