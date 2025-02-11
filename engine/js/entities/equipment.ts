import { TechnologyTypes } from "../TechnologyTypes";
import Events, { GameEvent } from "../events";
import { Defer } from "../Loop";
import Technology from "../technology";
import Entity from "./character/Entity";
import { Equipped } from "./character/mixins/Equipped";

Events.List.EquipmentChanged = "EquipmentChanged"
Events.List.CooldownComplete = "CooldownComplete";

export interface EquipmentChangedEvent extends GameEvent {
    from: Technology;
    to: Technology;
    equipped: EquippedTechnology;
    type: TechnologyTypes;
    character: Equipped;
}

export interface CooldownCompleteEvent extends GameEvent {
    equippedTechnology: EquippedTechnology;
    character: Entity & Equipped;
}

type EquipmentCollection = { [K in TechnologyTypes]?: EquippedTechnology };

export class EquippedTechnology {
    private _equipment: Equipment;
    private _technology: Technology;
    private _lastFired: number;
    private _ready: boolean;
    private _readyAt: number;

    get technology() { return this._technology; }
    get ready() { return this._ready; }
    get readyAt() { return this._readyAt; }
    get lastFired() { return this._lastFired; }

    set lastFired(newValue: number) {
        this._lastFired = newValue;
        this._readyAt = this._lastFired + this._technology.delay;
        this._ready = false;

        Defer(() => {
            let details: CooldownCompleteEvent = {
                equippedTechnology: this,
                character: this._equipment.character
            };
            this._ready = true;
            Events.RaiseEvent(Events.List.CooldownComplete, details);
        }, this._technology.delay);
    }

    constructor(technology: Technology, equipment: Equipment) {
        this._technology = technology;
        this._equipment = equipment;
        this._lastFired = performance.now();
        this._ready = false;
        this._readyAt = 0;
    }

    get name() { return this._technology.name; }
    get range() { return this._technology.range; }
    get damage() { return this._technology.damage; }
}

export default class Equipment {

    private _character: Entity & Equipped;    
    private _equipment: EquipmentCollection = {};

    constructor(character: Entity & Equipped) {
        this._character = character;
    }

    get attack() { return this._equipment[TechnologyTypes.ATTACK]; }

    get attackModifier() { return this._equipment[TechnologyTypes.ATTACK_MODIFIER]; }

    get buff() { return this._equipment[TechnologyTypes.BUFF]; }

    get character() { return this._character; }

    equip(technology: Technology) {
        
        this._equipment[technology.type as TechnologyTypes] = new EquippedTechnology(technology, this);

        const details: EquipmentChangedEvent = {
            type: technology.type,
            from: this.getEquipped(technology.type).technology,
            to: technology,
            character: this._character,
            equipped: this.getEquipped(technology.type)
        };

        Events.RaiseEvent(Events.List.EquipmentChanged, details);
        this._equipment[technology.type as TechnologyTypes].lastFired = performance.now();
    }
    
    getEquipped(techType: TechnologyTypes) {
        return this._equipment[techType];
    }
}
