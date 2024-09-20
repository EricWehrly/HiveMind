import { TechnologyTypes } from "../TechnologyTypes";
import Events, { GameEvent } from "../events";
import { Defer } from "../loop.mjs";
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
                id: null,
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

    // should these somehow be generated from Technology.Type ...?
    // (since we tie them together anyway on line 36)
    _attack: any = null;
    // attackModifier isn't actually used
    _attackModifier: any = null;
    #character;

    #buff: any = null;
    
    private _equipment: EquipmentCollection = {};

    constructor(character: Entity & Equipped) {
        this.#character = character;
    }

    get attack() { return this._attack; }

    set attack(newValue) { this._attack = newValue; }

    get attackModifier() { return this._attackModifier; }

    set attackModifier(newValue) { this._attackModifier = newValue; }

    get buff() { return this.#buff; }
    set buff(newValue) { this.#buff = newValue; }

    get character() { return this.#character; }

    equip(technology: Technology) {
        
        this._equipment[technology.type as TechnologyTypes] = new EquippedTechnology(technology, this);

        const details: EquipmentChangedEvent = {
            id: null,
            type: technology.type,
            from: this.getEquipped(technology.type).technology,
            to: technology,
            character: this.#character,
            equipped: this.getEquipped(technology.type)
        };

        Events.RaiseEvent(Events.List.EquipmentChanged, details);
        this._equipment[technology.type as TechnologyTypes].lastFired = performance.now();
    }
    
    getEquipped(techType: TechnologyTypes) {
        return this._equipment[techType];
    }
}
