import Events from "../events.mjs";

Events.List.EquipmentChanged = "EquipmentChanged"

export default class Equipment {

    // should these somehow be generated from Technology.Type ...?
    // (since we tie them together anyway on line 36)
    _attack = null;
    _attackModifier = null;

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

    equip(technology) {
        if (this[technology.type] === undefined) {
            console.warn(`Cannot equip type ${technology.type}`);
            return;
        }

        const details = {
            type: technology.type,
            from: this[technology.type],
            to: technology
        };

        Events.RaiseEvent(Events.List.EquipmentChanged, details);

        this[technology.type] = technology;
    }
}
