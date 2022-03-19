export default class Equipment {

    _attack = null;

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

    equip(technology) {
        if (this[technology.type] === undefined) {
            console.warn(`Cannot equip type ${technology.type}`);
            return;
        }

        this[technology.type] = technology;
    }
}
