import AI from "../../../ai/basic";
import { CharacterUtils } from "../CharacterUtils";
import Entity, { EntityOptions } from "../Entity";

export interface SentientOptions {
    ai?: typeof AI
    target?: Entity;
}

export interface Sentient {
    ai?: AI
    target?: Entity;
}

// TODO: let's do away with this axis hack
type Axis = 'x' | 'y';
const axes: Axis[] = ['x', 'y'];

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeSentient<T extends Constructor<Entity>>(Base: T, options: EntityOptions & SentientOptions) 
: T & Constructor<Sentient> {
    return class SentientClass extends Base implements Sentient {

        private _ai: AI;
        get ai() { return this._ai; }
        set ai(newValue) { this._ai = newValue; }
        private get targetPosition() { return this.ai.targetPosition; }
        get target() { return this.ai?.targetEntity; }
        set target(newValue) { 
            if(this.ai) {
                this.ai.targetEntity = newValue;
            }
            else console.warn('Tried to set target for sentient entity with no ai.');
        }

        constructor(...args: any) {
            super(...args);

            const ai = options.ai !== undefined ? options.ai : options.characterType?.ai;
            this.setupAI(ai);
        }

        private setupAI(ai: new (...args: any[]) => AI) {
            // TODO: let's default to no AI at all unless prescribed ...
            if (ai === undefined) this._ai = new AI(this);
    
            // TODO: Would be better to type-validate aiType (but it's a class, not an instance)
            else if (ai != null) {
                this._ai = new ai(this);
            }
        }

        // TODO: this amount needs to be broken down by axis, rather than used for each
            // (broken down, based on the desiredVector ratio)
            // (or, if necessary, distance across axes)
            // (so if we should move 7 of 10 amount on X, but our target is 3 away, the 4 gets 'transfered' to Y)
        move(amount: number) {
    
            if (!CharacterUtils.IsLocalPlayer(this) && this.shouldMoveToTarget()) {
                const desiredPosition = {
                    x: this.position.x,
                    y: this.position.y
                }

                for (const axis of axes) {
                    if (!this.atTarget(axis)) {
                        const newAxisPos = desiredPosition[axis] + (this.desiredMovementVector[axis] * this.speed * amount);
                        const targetPositionOnAxis = this.targetPosition[axis];
                        if(Math.abs(targetPositionOnAxis - newAxisPos) >= Math.abs(targetPositionOnAxis - this.position[axis])) {
                            desiredPosition[axis] = targetPositionOnAxis;
                        } else {
                            desiredPosition[axis] += this.desiredMovementVector[axis] * this.speed * amount;
                        }
                    }
                    this.position = desiredPosition;
                }
            } else {
                super.move(amount);
            }
        }
    
        shouldMoveToTarget() {
            return this.ai != null && this.ai.targetEntity != null;
        }
    
        shouldStopOnAxis(axis: Axis, amount: number) {
            return Math.abs(this.position[axis] - this.targetPosition[axis]) < this.speed * amount;
        }
    
        atTarget(axis: Axis) {
            return this.targetPosition != null && this.targetPosition[axis] == this.position[axis];
        }
    }
};

export function IsSentient(obj: Entity): obj is Entity & Sentient {
    const sentient = obj as Sentient;
    return sentient 
        && sentient.ai !== undefined
        && sentient.ai != null;
}
