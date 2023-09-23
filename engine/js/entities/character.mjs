import { AddCharacterToList, RemoveCharacterFromList } from './characters.mjs';
import { AssignWithUnderscores, copyPublicProperties, generateId } from '../util/javascript-extensions.js'
import CharacterAttribute from './character-attribute.mjs';
import Point from '../baseTypes/point.mjs';
import Technology from '../technology.mjs';
import Equipment from './equipment.mjs';
import BasicAI from '../ai/basic.mjs';
import Events from '../events.mjs';
import './character-graphics.mjs';
import { Defer } from '../loop.mjs';
import Faction from './faction.mjs';
import PredatorAI from '../ai/predator.mjs';

Events.List.CharacterCreated = "CharacterCreated";
Events.List.CharacterDied = "CharacterDied";
Events.List.CharacterTargetChanged = "CharacterTargetChanged";
Events.List.PlayerMoved = "PlayerMoved";
Events.List.PlayerChunkChanged = "PlayerChunkChanged";
Events.List.PlayerHealthChanged = "PlayerHealthChanged";

// TODO: #private properties rather than _private
export default class Character {

    // maybe we can find a way around this (better than how we do in game.js)
    // but for now hack in some dumb reference stuff
    static #LOCAL_PLAYER;

    static get LOCAL_PLAYER() {
        return Character.#LOCAL_PLAYER;
    }

    static set LOCAL_PLAYER(value) {
        Character.#LOCAL_PLAYER = value;
    }

    static get(options) {

        let charList = CHARACTER_LIST;
        if(options.name) {
            charList = charList.filter(x => x.name == options.name);
        }

        return charList;
    }

    _health = 1;

    get health() {
        return this._health;
    }

    set health(newValue) {
        if(this.dead) return;

        const oldValue = this._health;
        this._health = newValue;
        Events.RaiseEvent(Events.List.PlayerHealthChanged, {
            character: this,
            from: oldValue,
            to: newValue
        });
        if (this._health <= 0) this.die();
    }

    get maxHealth() {
        return this.#initialHealth;
    }

    _position = new Point(0, 0);
    #lastPosition = null;

    _velocity = {
        x: 0,
        y: 0
    }

    // TODO: use this variable for ... things
    get speed() {
        return this.getAttribute("Speed").value;
    }

    set speed(newValue) {        
        return this.getAttribute("Speed").value = newValue;
    }

    _technologies = [];

    _equipment = new Equipment(this);

    #spawnPosition = {};
    #initialHealth;

    _target = null;

    #maxWanderDistance = 10

    #faction = null;
    #research = {};
    #attributes = {};

    get faction() { return this.#faction; }

    // prevent trying to set x and y
    get x() { return this._position.x; }
    get y() { return this._position.y; }

    #thornMultiplier = 1;
    get thornMultiplier() { return this.#thornMultiplier; }
    set thornMultiplier(newValue) { this.#thornMultiplier = newValue; }

    constructor(options = {}) {
        
        if(options.position) { 
            this._position = new Point(options.position.x, options.position.y);
            delete options.position;
        };

        if(options.technologies) {
            for(var tech of options.technologies) {
                this.AddTechnology(tech);
            }
            delete options.technologies;
        }

        if(options.faction) {
            this.#faction = options.faction;
            delete options.faction;
        }

        if(options.research) {
            this.#research = options.research;
            delete options.research;
        }

        let speedVal = 1;
        if(options.speed) {

            speedVal = options.speed;
            delete options.speed;
        }

        AssignWithUnderscores(this, options);

        this.id = options.id || generateId();
        this.color = options.color;
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;
        // options.image
        this.#spawnPosition = new Point(this.position.x, this.position.y);
        this.#initialHealth = JSON.parse(JSON.stringify(this.health));
        
        this.addAttribute(new CharacterAttribute({
            name: 'Speed',
            value: speedVal,
            baseCost: 40,
            costFunction: this.logarithmicCost
        }));

        if(options.isPlayer) {
            this.#faction = new Faction({ 
                name: this.name,
                color: this.color
            });
        }

        // TODO: let's default to no AI at all unless prescribed ...
        this.setupAI(options.ai);

        AddCharacterToList(this);

        Events.RaiseEvent(Events.List.CharacterCreated, this, {
            isNetworkBoundEvent: true
        });
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
        console.debug(`New target for ${this.name}: ${this?.target?.position?.x}, ${this?.target?.position?.y}`);
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

    // this may get confusing
    get maxWanderDistance() {
        const aggressionRange = this.aggressionRange;
        if(aggressionRange > 0) return aggressionRange * 1.5;
        else return this.#maxWanderDistance;
    }

    // TODO: implement variable character attributes
    get vision() {
        return 1;
    }

    get aggressionRange() {
        // not vision. the range of the equipped attack
        return this.aggression * (this?.equipment?.attack?.range || 0);
    }

    get hostile() {

        // TODO: faction calculation
        // if ai is predator
        return this.ai instanceof PredatorAI;
    }

    logarithmicCost(characterAttribute) {
        
        const baseCost = characterAttribute.baseCost || 1;
        return Math.round(baseCost + Math.log(characterAttribute.value * baseCost));
    }

    addAttribute(characterAttribute) {

        this.#attributes[characterAttribute.name] = characterAttribute;
    }

    getAttribute(name) {

        return this.#attributes[name];
    }

    hasTechnology(technology) {

        if (typeof technology == "string") {
            technology = Technology.Get(technology);
        } // else warn?
        return this._technologies.includes(technology);
    }

    // this either needs an event or to be moved into equipment.mjs
    AddTechnology(technologyName) {
        
        const technology = Technology.Get(technologyName);
        console.debug(`Adding technology ${technology.name} to character ${this.name}`);
        this._technologies.push(technology);

        if(technology.type) {
            if (!this.hasEquipped(technology.type)) {
                this.equip(technology);
            }

            console.debug(`${technology.type} equipped: ${this.getEquipped(technology.type).name}`);
        }
        
        // CharacterType[character.target.characterType].isStudied = true;
        if(technology.research) {

            // const research = Research.Get(technology.research);
            technology.research.enabled = true;
        }
    }

    shouldStopTargeting(distance = 6) {

        return this.target
            && (this.target.isAlive == false || 
                this.target.getDistance(this) > distance);
    }

    statusEffectThink() {
        for(var key in Object.keys(this.#statusEffects)) {
            const statusEffect = this.#statusEffects[key];
            if(statusEffect > performance.now()) {
                delete this.#statusEffects[key];
            }
        }
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

        this.statusEffectThink();
    }

    pointAtTarget(target) {

        if (target) {
            if (this.position.x != target.position.x
                || this.position.y != target.position.y) {
                if (this.position.x < target.position.x) this._velocity.x = 1;
                else if (this.position.x > target.position.x) this._velocity.x = -1;
                if (this.position.y < target.position.y) this._velocity.y = 1;
                else if (this.position.y > target.position.y) this._velocity.y = -1;
            }
        } else {
            this._velocity.x = 0;
            this._velocity.y = 0;
        }
    }

    shouldMoveToTarget() {
        return this.ai != null && this.target != null;
    }

    shouldStopOnAxis(axis, amount) {
        return Math.abs(this._position[axis] - this.target.position[axis]) < this.speed * amount;
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
                        this._position[axis] += this._velocity[axis] * this.speed * amount;
                    }
                }
            }
        } else {
            this._position.x += this._velocity.x * this.speed * amount;
            this._position.y += this._velocity.y * this.speed * amount;
        }

        // TODO: We can probly extract to a method (#positionUpdated)
        // and call from within the position setter
        if(!this._position.equals(this.#lastPosition)) {
            if(this.isPlayer) {
                Events.RaiseEvent(Events.List.PlayerMoved, {
                    character: this,
                    from: this.#lastPosition,
                    to: this._position
                    }, {
                    isNetworkBoundEvent: true
                });
                
                if(!this._position.chunk.equals(this.#lastPosition?.chunk)) {
                    Events.RaiseEvent(Events.List.PlayerChunkChanged, {
                        character: this,
                        from: this.#lastPosition?.chunk,
                        to: this._position.chunk
                    }, {
                        isNetworkBoundEvent: true
                    });
                }
            }
            this.#lastPosition = copyPublicProperties(this._position)
        }
    }

    setupAI(aiType) {
        if (aiType === undefined) this.ai = new BasicAI(this);

        // TODO: Would be better to type-validate aiType (but it's a class, not an instance)
        else if (aiType != null) this.ai = new aiType(this);
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

    getNearbyEntities(options = {}) {

        options.max = options.max || 10;
        options.distance = options.distance || 100;

        const nearbyEntities = [];

        for (var character of CHARACTER_LIST) {

            if(character == this 
                || this.#shouldFilterCharacter(character, options)) {
                continue;
            }

            // Remember this is going to be weird because we're doing origin coordinates
            // rather than bounding boxes
            const distance = character.getDistance(this);
            if (distance < options.distance) {
                nearbyEntities.push({
                    distance,
                    entity: character
                });
            }
        }

        nearbyEntities.sort(this.#nearestSort);
        if(nearbyEntities.length > options.max) {
            nearbyEntities.splice(options.max - 1);
        }

        return nearbyEntities;
    }

    // TODO: Need to prioritize close hostile entities over closer non-hostile
    getClosestEntity(options = {
        distance: 100,
        filterChildren: true,
        hostile: null,
        isPlayer: null,
        characterType: null,
        // Maybe rather than listing individual properties like this,
        // we could have a way to automatically map properties?
        grown: null,
        exclude: [],
        faction: null,
        priorities: []
    }) {

        const nearbyEntities = this.getNearbyEntities(options);

        // NOW implement priorities

        return nearbyEntities[0]?.entity;
    }

    #nearestSort(first, second) {

        if(first.distance > second.distance) {
            return 1;
        } else if(second.distance > first.distance) {
            return -1;
        } else {
            return 0;
        }
    }

    #shouldFilterCharacter(character, options) {

        if (options.filterChildren && character.parent == this) {
            return true;
        }
        if (options.hostile != null && character.isHostile != options.hostile) {
            return true;
        }
        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(options.characterType != null && character.characterType != options.characterType) {
            return true;
        }
        if(options.exclude && options.exclude.includes(character)) {
            return true;
        }
        if(options.grown != null && character.isGrown != options.grown) {
            return true;
        }
        if(options.faction && character.faction != options.faction) {
            return true;
        }

        return false;
    }

    // private?
    // TODO: Should we just flag not alive and defer 'fading out' corpse?
    die() {        
        // console.log(`${this.name} is dead now.`);
        if(this.graphic) document.getElementById("playfield").removeChild(this.graphic);
        
        Events.RaiseEvent(Events.List.CharacterDied, this);

        if(this.isPlayer) alert('So the player is dead now ... this is game over.');
        
        RemoveCharacterFromList(this);
    }

    #statusEffects = {};

    getStatusEffect(statusEffect) {

        if(!(statusEffect in this.#statusEffects)) {
            this.#statusEffects[statusEffect] = performance.now();
        }
        
        return this.#statusEffects[statusEffect];
    }

    /**
     * 
     * @param {StatusEffect} statusEffect 
     * @param {int} duration ms
     */
    applyStatusEffect(statusEffect, duration) {

        this.#statusEffects[statusEffect] = this.getStatusEffect(statusEffect) + duration;

        const now = performance.now();
        const options = {
            startTime: now,
            endTime: now + duration,
            lastInterval: 0,
            target: this.target,
            duration
        }
        if(options.target == null) debugger;
        Defer(function() {
            statusEffect.callback(options)
        }, statusEffect.interval + 1);
    }

    equals(character) {
        return character instanceof Character
            && character?.id == this.id;
    }
}
