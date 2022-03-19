export default class Equipment {

    _attack = null;

    get attack() {
        return this._attack;
    }

    set attack(newValue) {
        this._attack = newValue;
    }

    equip(technology) {
        if(this[technology.type] === undefined) {
            console.warn(`Cannot equip type ${technology.type}`);
            return;
        }

        this[technology.type] = technology;
    }
}
