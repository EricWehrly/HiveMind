import AI from "../../../ai/basic";
import { RegisterLoopMethod } from "../../../loop.mjs";
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

// TODO: recompute this when chunk active changes
// TODO: remove characters from list when they die
const CreaturesThatShouldThink: Record<string, AI> = {};

function thinkOnSlowLoop(elapsed: number) {
    for(const [id, ai] of Object.entries(CreaturesThatShouldThink)) {

        const character = ai.character;

        // The following lines are essentially an 'efficiency' check
        // in a crazy infinite supercomputer, it would be unnecessary to 
        // process a potentially unlimited chunks worth of entities
        // but this is a very (computationally) easy check 
        // to drastically limit to only exactly where the player is.
        // We could, in theory, write simple enough AI to support that,
        // but Rain World has low creature counts to allow complex thinking,
        // and also we are not making Rain World.
        if(character?.position?.chunk?.active == false
            // @ts-expect-error
            || character?.dead == true) {
            continue;
        }
        
        ai.think(elapsed);
    }
};

RegisterLoopMethod(thinkOnSlowLoop, true);

export function MakeSentient<T extends Constructor<Entity>>(Base: T) 
: T & Constructor<Sentient> {
    return class SentientClass extends Base implements Sentient {
    
        private _ai: AI;
        get ai() { return this._ai; }
        set ai(newValue) { this._ai = newValue; }
        get target() { return this.ai?.targetEntity; }
        set target(newValue) { 
            if(this.ai) {
                this.ai.targetEntity = newValue;
            }
            else console.warn('Tried to set target for sentient entity with no ai.');
        }
    
        constructor(...args: any) {
            super(...args);
    
            const [options]: (EntityOptions & SentientOptions)[] = args;
    
            const ai = options.ai !== undefined ? options.ai : options.characterType?.ai;
            this.setupAI(ai);
        }
    
        private setupAI(aiType: new (...args: any[]) => AI) {
            // TODO: let's default to no AI at all unless prescribed ...
            // for now, deliberate null is treated as deliberate, but why?
            if (aiType === undefined) this._ai = new AI(this);
    
            else if (aiType != null) {
                this._ai = new aiType(this);
            }

            // despite the monologue below,
            // we should try to track down what circumstances are causing
            // this.ai to be null
            // because ultimately, if you can't be sentient without ai,
            // that's a very good limit for us to deliberately impose
            // if(this.ai == null) debugger;

            // this 'if' check effectively validates that 
            // 'null' is a legitimate value for this.ai of a Sentient entity
            // that doesn't seem right, though? what would be sentient without ai?
            // is THIS the true base ai class?
            // I think it's got parts of that
            // and I think part 'common' space for ALL AIs ...
            // but why wouldn't that be the base class?
            if(this.ai) {
                CreaturesThatShouldThink[this.id] = this.ai;
            }
        }

        // should this be where we set desiredMovementVector?
        // where is it being set now? 
        // (in ai itself, probably)
        // NO! desiredMovementVector SHOULD be set in basic.ts...
    };
};

export function IsSentient(obj: Entity): obj is Entity & Sentient {
    const sentient = obj as Sentient;
    return sentient 
        && sentient.ai !== undefined
        && sentient.ai != null;
}
