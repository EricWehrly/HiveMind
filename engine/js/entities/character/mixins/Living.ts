import Events from "../../../events";
import { RemoveCharacterFromList } from "../../characters.mjs";
import Entity from "../Entity";

Events.List.PlayerHealthChanged = "PlayerHealthChanged";
Events.List.CharacterDied = "CharacterDied";

export interface Living {
    health?: number;
    maxHealth?: number;
    dead?: boolean;
    // TODO: change to 'alive' to be consistent
    isAlive?: boolean;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeLiving<T extends Constructor>(Base: T, health: number, maxHealth: number) {
    return class extends Base implements Living {

        private _health = health;
        private _initialHealth = maxHealth || health;
    
        get size() { 
            // TODO: address this magic number
            return this.health / 40;
        }
    
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
            // this was the old way of describing "living". We have a class now
            //  && (this.isPlayer || this.ai != null);
        }
    
        // private?
        // TODO: Should we just flag not alive and defer 'fading out' corpse?
        die() {
            Events.RaiseEvent(Events.List.CharacterDied, this);
            
            RemoveCharacterFromList(this);
        }
    }
}

export function IsLiving(obj: Entity): obj is Entity & Living {
    return (obj as Living).health !== undefined;
}
