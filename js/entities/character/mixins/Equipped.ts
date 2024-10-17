import { TechnologyTypes } from "../../../TechnologyTypes";
import Logger from "../../../core/Logger";
import Technology from "../../../technology";
import Equipment, { EquippedTechnology } from "../../equipment";
import Entity from "../Entity";

export interface Equipped {
    technologies: Technology[];
    equipment: Equipment;
    AddTechnology(technology: Technology): void;
    getEquipped(technologyType: TechnologyTypes): EquippedTechnology;
    getAttackRange(): number;
}

export interface EquippedOptions {
    technologies?: Technology[];
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeEquipped<T extends Constructor<Entity>>(Base: T) {
    return class EquippedEntity extends Base implements Equipped {
        
        private _equipment: Equipment = new Equipment(this);
        private _technologies: Technology[] = [];
        
        get technologies() { return this._technologies; }
        get equipment() { return this._equipment; }

        constructor(...args: any) {
            super(...args);
    
            const [options]: (EquippedOptions)[] = args;
            if(options.technologies) {
                for(var tech of options.technologies) {
                    this.AddTechnology(tech);
                }
            }
        }

        getAttackRange(): number {
            const attack = this.getEquipped(TechnologyTypes.ATTACK);
            if(attack && attack.range) return attack.range;
            else return null;
        }

        hasEquipped = function (techType: Technology | TechnologyTypes): boolean {
            return this.getEquipped(techType) != null;
        }
    
        equip = function (technology: Technology) {
            this._equipment.equip(technology);
        }

        getEquipped = function (techType: TechnologyTypes): EquippedTechnology {
            return this._equipment.getEquipped(techType);
        }

        // this either needs an event or to be moved into equipment.mjs
        AddTechnology(technology: Technology) {
            
            Logger.debug(`Adding technology ${technology.name} to character ${this.name}`);
            this._technologies.push(technology);
    
            if(technology.type) {
                if (!this.hasEquipped(technology.type)) {
                    this.equip(technology);
                }
    
                Logger.debug(`${technology.type} equipped: ${this.getEquipped(technology.type).name}`);
            }
            
            // CharacterType[character.target.characterType].isStudied = true;
            if(technology.research) {
    
                // const research = Research.Get(technology.research);
                technology.research.enabled = true;
            }
        }
    }
}

export function IsEquipped(obj: Entity): obj is Entity & Equipped {
    return (obj as unknown as Equipped).equipment !== undefined;
}
