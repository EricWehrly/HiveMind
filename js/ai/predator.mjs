import AI from "./basic.mjs";
import Character from "../entities/character.mjs";
import Action from "../action.mjs";

export default class PredatorAI extends AI {

    constructor(character) {
        super(character);

        console.log("I A PREDATOR")
    }
    
    think() {

        // TODO: hunt fauna (the herbivores are gonna hunt food too)
        
        if(this.leashing == false) {
            if(this.#shouldTarget()) {
                // const wasTarget = this.#character.target;
                const closest = this.character.getClosestEntity({
                    distance: this.character.aggressionRange,
                    isPlayer: true
                });
                if(closest != null) this.character.target = closest;
                /*
                if(wasTarget != this.#character.target && this.#character.target != null) {
                    const dist = this.#character.target.getDistance(this.#character);
                    console.debug(`Acquiring target ${this.#character.target.name}`);
                    console.debug(`Target distance: ${dist}. Aggression range: ${this.#character.aggressionRange}`);
                }
                */
            }
        }

        super.think();

        if(this.#shouldAttack()) {
            // this.#attack(this.character.target);
            this.#attack();
        }
    }

    #shouldTarget() {
        return this.character.aggression > 0 
            && (this.character.target == null || !(this.character.target instanceof Character));
    }

    #shouldAttack() {

        return this.character.target instanceof Character;
    }

    #attack() {
        
        Action.List['attack'].callback({
            character: this.character
        });
    }
}
