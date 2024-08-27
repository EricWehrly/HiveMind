import Resource from "../../../../engine/js/entities/resource";
import HiveMindCharacter from "../HiveMindCharacter";
import { MakeHiveMindCharacter } from "../HivemindCharacterFactory";
import { Living, MakeLiving } from "../../../../engine/js/entities/character/mixins/Living";
import { IsEquipped, MakeEquipped } from "../../../../engine/js/entities/character/mixins/Equipped";
import { CharacterFilterOptions } from "../../../../engine/js/entities/character/Entity";
import { Combative, MakeCombative } from "../../../../engine/js/entities/character/mixins/Combative";

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

export interface SlimeyOptions {
    parent?: HiveMindCharacter;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeSlimey<T extends Constructor<HiveMindCharacter>>(Base: T, options: SlimeyOptions) {
    return class SlimeyClass extends Base implements Slimey {

        parent?: HiveMindCharacter & Living = options?.parent;
        
        // TODO: set character current subdivision task/purpose
        Subdivide (options: SubdivideOptions = {}) {
    
            const amount = options.amount || HiveMindCharacter.SUBDIVIDE_COST;
            let purpose;
            if (options.purposeKey) purpose = HiveMindCharacter.Purposes[options.purposeKey];
            else if (options.purpose) purpose = options.purpose;
            // else if not in that array ...
            else purpose = this.purpose;
    
            if(purpose == null) {
                if(this.isPlayer) console.log("Tell the player they can't subdivbide (no purpose)");
                return;
            }
        
            if (!this.canAfford(amount)) {
                if(this.isPlayer) console.log("Tell the player they can't subdivbide (cant afford)");
                return;
            }
        
            (this as Living).health -= amount;
        
            const name = options.name || "Slime Worker";
            const entityRenderingSettings = {
                renderedName: purpose.name
            };
            const faction = (this as unknown as Combative).faction;
            const spawnedCharacter = MakeHiveMindCharacter([MakeSlimey, MakeLiving, MakeCombative, MakeEquipped], {            
                name,
                health: amount,
                maxHealth: amount * 2,  // only if consume? or in general is probly fine ... for now ...
                position: this.position,
                currentPurposeKey: purpose.name.toLowerCase(),
                faction,
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

            const thisLiving = this as Living;
    
            if(thisLiving.health == 0 || this.parent == null) debugger;
    
            const maxToGive = this.parent.maxHealth - this.parent.health;
            const amountToGive = Math.min(thisLiving.health, maxToGive);
    
            if(thisLiving.health > amountToGive) {
                const food = Resource.Get("food");
                food.value += thisLiving.health - amountToGive;
            }
    
            if(IsEquipped(this) && IsEquipped(this.parent)) {
                if(this.technologies && this.technologies.length > 0) {
                    this.parent.AddTechnology(this.technologies[0]);
                }
            }
            thisLiving.health = 0;
            this.parent.health += amountToGive;
        }

        shouldFilterCharacter(character: HiveMindCharacter & Slimey, options: CharacterFilterOptions & SlimeyOptions & { filterChildren: boolean }): boolean {
            if (options.filterChildren && character.parent == this) {
                return true;
            }
            
            return super.shouldFilterCharacter(character, options);
        }
    }
}
