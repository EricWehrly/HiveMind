import Events from "../events.mjs";
import Technology from "../technology.mjs";

Events.List.EquipmentChanged = "EquipmentChanged"

export default class Equipment {

    // should these somehow be generated from Technology.Type ...?
    // (since we tie them together anyway on line 36)
    _attack = null;
    // attackModifier isn't actually used
    _attackModifier = null;
    #character;

    #buff = null;

    constructor(character) {

        character.getEquipped = function (techType) {
            return this._equipment[techType];
        }

        character.hasEquipped = function (techType) {
            return this.getEquipped(techType) != null;
        }

        character.equip = function (technology) {
            this._equipment.equip(technology);
        }

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

    equip(technology) {
        if (this[technology.type] === undefined) {
            console.warn(`Cannot equip type ${technology.type}`);
            return;
        }

        const details = {
            type: technology.type,
            from: this[technology.type],
            to: technology,
            character: this.#character
        };

        Events.RaiseEvent(Events.List.EquipmentChanged, details);

        // if we were to write a unit test here, it would say:
        // assigned must be a new instance, not a reference to an existing one
        this[technology.type] = new Technology(technology);
    }
}
