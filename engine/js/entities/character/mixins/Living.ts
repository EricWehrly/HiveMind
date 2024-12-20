import CharacterType from "../../../../../js/entities/CharacterType";
import Events, { GameEvent } from "../../../events";
import Entity from "../Entity";
import { EntityOptions } from "../EntityOptions";

Events.List.CharacterDamaged = "CharacterDamaged";
Events.List.CharacterDied = "CharacterDied";

export interface Living {
    health?: number;
    maxHealth?: number;
    dead?: boolean;
    // TODO: change to 'alive' to be consistent
    isAlive?: boolean;
    damage?(amount: number, source: Entity): void;
}

export interface LivingOptions {
    health?: number;
    maxHealth?: number;
    characterType?: CharacterType;
}

export interface CharacterDamagedEvent extends GameEvent {
    character: Entity & Living;
    amount: number;
    attacker: Entity;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeLiving<T extends Constructor<Entity>>(Base: T) {
    return class LivingClass extends Base implements Living {

        // TODO: value of health when options is null
        private _health: number;
        private _initialHealth: number;
    
        get size() { 
            // TODO: address this magic number
            return this.health / 40;
        }
    
        get health() {
            return this._health;
        }
    
        set health(newValue) {
            if(this.dead) return;

            this._health = newValue;
            if (this._health <= 0) this.die();
        }
    
        get maxHealth() {
            return this._initialHealth;
        }
    
        // TODO: wish this was 'protected'
        set maxHealth(newValue) {
            this._initialHealth = newValue;
        }
    
        get dead() {
            return this._health <= 0;
        }
    
        get isAlive() {
            return !this.dead
        }

        constructor(...args: any) {
            super(...args);

            const [options]: (EntityOptions & LivingOptions)[] = args;

            this._health = options?.health || options.characterType?.health || 0;
            this._initialHealth = this._health;
        }

        damage(amount: number, attacker: Entity) {
            this.health -= amount;

            const event : CharacterDamagedEvent = {
                character: this,
                amount,
                attacker: attacker
            };
            Events.RaiseEvent(Events.List.CharacterDamaged, event);
        }
    
        // private?
        // TODO: Should we just flag not alive and defer 'fading out' corpse?
        die() {
            Events.RaiseEvent(Events.List.CharacterDied, { entity: this });
            super.destroy();
        }
    }
}

export function IsLiving(character: Entity): character is Entity & Living {
    const living = character as Entity & Living;
    return typeof living.health === 'number';
}
