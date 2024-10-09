import WorldCoordinate from "../coordinates/WorldCoordinate";
import Point from "../coordinates/point";
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
            // if we have a 'target', it's because we want to run away from it
            // (for now, until target / entity relationships are set up,
            //  and we can determine if the target is a predator we're running from or 
            //  a yummy snack)
            const targetX = this.targetEntity.position.x * -1;
            const targetY = this.targetEntity.position.y * -1;
            this.character.pointAtTarget(new Point(targetX, targetY));
        }
    }

    shouldStopTargeting(distance = 4) {

        const target = this.targetEntity as Entity & Living;

        return target
            && (target.isAlive == false || 
                target.getDistance(this.character) > distance);
    }
}