import LivingEntity from "../entities/character/LivingEntity";
import AI from "./basic";

export default class PreyAI extends AI {
    
    think() {        
        // run away from predators (including players)
        
        if(this.shouldStopTargeting()) {
            this.target = null;
        }
        
        this.target = this.character.getClosestEntity({ distance: 3 });

        if(!this.target) {
            this.wander();
        } else { 
            this.character.pointAtTarget();
            this.character._velocity.x *= -1;
            this.character._velocity.y *= -1;
        }
    }

    shouldStopTargeting(distance = 4) {

        const target = this.target as LivingEntity;

        return target
            && (target.isAlive == false || 
                target.getDistance(this.character) > distance);
    }
}