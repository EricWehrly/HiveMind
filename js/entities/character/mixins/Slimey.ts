import Resource from "../../../../engine/js/entities/resource.mjs";
import HiveMindCharacter from "../HiveMindCharacter";
import { MakeHiveMindCharacter } from "../CharacterFactory";

export interface SubdivideOptions {
    amount?: number;
    purposeKey?: string;
    purpose?: any;
    name?: string;
    technologies?: any;
    target?: any;
}

export interface Slimey {
    parent?: HiveMindCharacter;
    Subdivide(options: SubdivideOptions): any;
    Reabsorb(): void;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeSlimey<T extends Constructor<HiveMindCharacter>>(Base: T, options: any) {
    return class extends Base implements Slimey {

        parent?: HiveMindCharacter = options.parent;
        
        // TODO: set character current subdivision task/purpose
        Subdivide (options: SubdivideOptions = {}) {
    
            const amount = options.amount || HiveMindCharacter.SUBDIVIDE_COST;
            let purpose;
            if (options.purposeKey) purpose = HiveMindCharacter.Purposes[options.purposeKey];
            else if (options.purpose) purpose = options.purpose;
            // else if not in that array ...
            else purpose = HiveMindCharacter.Purposes[this._currentPurposeKey];
    
            if(purpose == null) {
                if(this.isPlayer) console.log("Tell the player they can't subdivbide (no purpose)");
                return;
            }
        
            if (!this.canAfford(amount)) {
                if(this.isPlayer) console.log("Tell the player they can't subdivbide (cant afford)");
                return;
            }
        
            this.health -= amount;
        
            const name = options.name || "Slime Worker";
            const entityRenderingSettings = {
                renderedName: purpose.name
            };
            const spawnedCharacter = MakeHiveMindCharacter([MakeSlimey], {            
                name,
                health: amount,
                maxHealth: amount * 2,  // only if consume? or in general is probly fine ... for now ...
                position: this.position,
                _currentPurposeKey: purpose.name.toLowerCase(),
                faction: this.faction,
                technologies: options.technologies,
                entityRenderingSettings,
                parent: this
            });
            if (options.target) spawnedCharacter.target = options.target;
            console.debug(`Subdivided new character for ${spawnedCharacter.purpose.name}`);        
    
            return spawnedCharacter;
        }
    
        // to be called on the child to be reabsorbed into the parent
        Reabsorb() {
    
            if(this.health == 0 || this.parent == null) debugger;
    
            const maxToGive = this.parent.maxHealth - this.parent.health;
            const amountToGive = Math.min(this.health, maxToGive);
    
            if(this.health > amountToGive) {
                const food = Resource.Get("food");
                food.value += this.health - amountToGive;
            }
    
            if(this.technologies && this.technologies.length > 0) {
                this.parent.AddTechnology(this.technologies[0]);
            }
            this.health = 0;
            this.parent.health += amountToGive;
        }
    }
}
