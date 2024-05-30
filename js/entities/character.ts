// @ts-nocheck
import { AssignWithUnderscores } from '../util/javascript-extensions.mjs'
import './character-graphics.mjs';
import { Defer } from '../loop.mjs';
import Faction from './faction.mjs';
import Tooltip from '../ui/tooltip.mjs';
import Entity from './character/Entity';
import { Combatant } from './character/Combatant';

// TODO: #private properties rather than _private
export default class Character extends Combatant {

    toolTip: Tooltip;
    controller: any; // inputdevice

    private _faction = null;
    #research = {};

    get faction() { return this._faction; }
    set faction(value) { this._faction = value; }

    private _thornMultiplier = 1;
    get thornMultiplier() { return this._thornMultiplier; }
    set thornMultiplier(newValue) { this._thornMultiplier = newValue; }

    private _statusEffects = {};

    constructor(options = {}) {
        super(options);

        if(options.faction) {
            this._faction = options.faction;
            delete options.faction;
        }

        if(options.research) {
            this.#research = options.research;
            delete options.research;
        }

        AssignWithUnderscores(this, options);

        this.color = options.color;
        // TODO: Find a better way to have a cancellable default?
        if (options.color === null) delete this.color;

        if(options.isPlayer) {
            this.faction = new Faction({ 
                name: this.name,
                color: this.color
            });
        }
    }

    think() {
        super.think();

        this.statusEffectThink();
    }

    // this is unused ...
    getScreenPosition() {

        // TODO: get grid size constant from css
        const gridSize = 32;
        return {
            x: this.position.x * gridSize,
            y: this.position.y * gridSize
        };
    }

    // TODO: Make private ... and push down?
    shouldFilterCharacter(character: Entity, options) {

        if (options.filterChildren && character.parent == this) {
            return true;
        }
        if (options.hostile != null && character.isHostile != options.hostile) {
            return true;
        }
        if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
            return true;
        }
        if(options.characterType != null && character.characterType != options.characterType) {
            return true;
        }
        if(options.exclude && options.exclude.includes(character)) {
            return true;
        }
        if(options.grown != null && character.isGrown != options.grown) {
            return true;
        }
        if(options.faction && character.faction != options.faction) {
            return true;
        }
        if(options.characterProperties) {
            for(var key of Object.keys(options.characterProperties)) {
                if(character[key] != options.characterProperties[key]) {
                    return true;
                }
            }
        }

        return false;
    }

    getStatusEffect(statusEffect) {

        if(!(statusEffect in this._statusEffects)) {
            this._statusEffects[statusEffect] = performance.now();
        }
        
        return this._statusEffects[statusEffect];
    }

    statusEffectThink() {
        for(var key in Object.keys(this._statusEffects)) {
            const statusEffect = this._statusEffects[key];
            if(statusEffect > performance.now()) {
                delete this._statusEffects[key];
            }
        }
    }

    /**
     * 
     * @param {StatusEffect} statusEffect 
     * @param {int} duration ms
     */
    applyStatusEffect(statusEffect, duration) {

        this._statusEffects[statusEffect] = this.getStatusEffect(statusEffect) + duration;

        const now = performance.now();
        const options = {
            startTime: now,
            endTime: now + duration,
            lastInterval: 0,
            target: this.target,
            duration
        }
        if(options.target == null) debugger;
        Defer(function() {
            statusEffect.callback(options)
        }, statusEffect.interval + 1);
    }
}

if(window) window.Character = Character;
