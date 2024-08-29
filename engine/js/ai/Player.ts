import { IsEquipped } from "../entities/character/mixins/Equipped";
import AI from "./basic";

export default class PlayerAI extends AI {
    think() {
        // super.think();

        const character = this.character;

        if(IsEquipped(character)) {        
            // for now just target the closest thing. get more complicated later
            const dist = character.getAttackRange() || 5;
            const closestOptions = {
                distance: dist,
                filterChildren: true,
                // priorities: [CharacterType.]
            };
            this.targetEntity = character.getClosestEntity(closestOptions);

            /*
            if(this.shouldStopTargeting()) {
                this.target = null;
            }
            // TODO: Use range of equipped attack?
            if (!this.target || !this.target.isAlive) {
                this.target = this.getClosestEntity({ distance: 5 });
            }
            */
        }
    }
}
