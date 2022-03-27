import AI from "./basic.mjs";

export default class PreyAI extends AI {
    
    think() {        
        // run away from predators (including players)
        
        if(this.shouldStopTargeting()) {
            this.target = null;
        }
        
        this.target = this.#character.getClosestEntity({ distance: 3 });

        if(!this.target) {
            this.wander();
        } else { 
            this.#character.pointAtTarget();
            this.#character._velocity.x *= -1;
            this.#character._velocity.y *= -1;
        }
    }

    shouldStopTargeting(distance = 4) {

        return this.target
            && (this.target.isAlive == false || 
                this.target.getDistance(this) > distance);
    }
}