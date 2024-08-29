import Entity from "../entities/character/Entity";
import { Living } from "../entities/character/mixins/Living";
import AI from "./basic";

export default class PreyAI extends AI {
    
    think() {        
        // run away from predators (including players)
        
        if(this.shouldStopTargeting()) {
            this.targetEntity = null;
        }
        
        this.targetEntity = this.character.getClosestEntity({ distance: 3 });

        if(!this.targetEntity) {
            this.wander();
        } else { 
            this.character.pointAtTarget();
            this.character.desiredMovementVector.x *= -1;
            this.character.desiredMovementVector.y *= -1;
        }
    }

    shouldStopTargeting(distance = 4) {

        const target = this.targetEntity as Entity & Living;

        return target
            && (target.isAlive == false || 
                target.getDistance(this.character) > distance);
    }
}