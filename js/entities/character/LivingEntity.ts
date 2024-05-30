import Events from "../../events.mjs";
import { RemoveCharacterFromList } from "../characters.mjs";
import Entity from "./Entity";

// @ts-ignore
Events.List.PlayerHealthChanged = "PlayerHealthChanged";
// @ts-ignore
Events.List.CharacterDied = "CharacterDied";

export default class LivingEntity extends Entity {

    _health = 1;
    #initialHealth: number;

    get health() {
        return this._health;
    }

    set health(newValue) {
        if(this.dead) return;

        const oldValue = this._health;
        this._health = newValue;
        // @ts-ignore
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

    // TODO: wish this was 'protected'
    set maxHealth(newValue) {
        this.#initialHealth = newValue;
    }

    get dead() {
        return this._health <= 0;
    }

    get isAlive() {
        return !this.dead
        // this was the old way of describing "living". We have a class now
        //  && (this.isPlayer || this.ai != null);
    }

    constructor(options: any) {
        super(options);

        this.maxHealth = options.maxHealth || 1;
        this.health = options.health || this.maxHealth;

        this.#initialHealth = this.maxHealth;
        
        if(!options.maxHealth) this.#initialHealth = JSON.parse(JSON.stringify(this.health));
    }

    // private?
    // TODO: Should we just flag not alive and defer 'fading out' corpse?
    die() {        
        // @ts-ignore
        Events.RaiseEvent(Events.List.CharacterDied, this);
        
        RemoveCharacterFromList(this);
    }
}
