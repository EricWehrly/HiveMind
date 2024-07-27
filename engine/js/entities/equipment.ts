import { TechnologyTypes } from "../TechnologyTypes";
import Events from "../events";
import Technology from "../technology";
import Entity from "./character/Entity";

Events.List.EquipmentChanged = "EquipmentChanged"

type EquipmentCollection = { [K in TechnologyTypes]?: Technology };

export default class Equipment {

    // should these somehow be generated from Technology.Type ...?
    // (since we tie them together anyway on line 36)
    _attack: any = null;
    // attackModifier isn't actually used
    _attackModifier: any = null;
    #character;

    #buff: any = null;
    
    // private _equipment: { [key: typeof techTypes]: Technology } = {};;
    private _equipment: EquipmentCollection = {};

    constructor(character: Entity) {

        // rather than doing as below, "Equipped" probably needs to be a partial class that gets &'d in ...

        /*
        character.getEquipped = function (techType) {
            return this._equipment[techType];
        }

        character.hasEquipped = function (techType) {
            return this.getEquipped(techType) != null;
        }

        character.equip = function (technology) {
            this._equipment.equip(technology);
        }
        */

        this.#character = character;
    }

    get attack() {
        return this._attack;
    }

    set attack(newValue) {
        this._attack = newValue;
    }

    get attackModifier() {
        return this._attackModifier;
    }

    set attackModifier(newValue) {
        this._attackModifier = newValue;
    }

    get buff() { return this.#buff; }
    set buff(newValue) {
        this.#buff = newValue;
    }

    equip(technology: Technology) {

        const details = {
            type: technology.type,
            from: this.getEquipped(technology.type),
            to: technology,
            character: this.#character
        };

        Events.RaiseEvent(Events.List.EquipmentChanged, details);

        // if we were to write a unit test here, it would say:
        // assigned must be a new instance, not a reference to an existing one
        // this[technology.type] = new Technology(technology);

        // this._equipment[technology.type] = new Technology(technology);
        this._equipment[technology.type as TechnologyTypes] = technology;
    }
    
    getEquipped(techType: TechnologyTypes) {
        return this._equipment[techType];
    }
}
