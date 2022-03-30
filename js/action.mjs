// these actions should really be in the game, not the engine
import Character from '../../js/entities/character-extensions.mjs';
import Listed from './baseTypes/listed.mjs';
import Requirements from './requirements.mjs';

export default class Action extends Listed {

    // TODO: Read from config json?
    static {
        new Action({
            name: 'move_up',
            callback: function(options) {
                if(options?.character?.velocity?.y != null) {
                    options.character.velocity.y = -1;
                }
            }
        });

        new Action({
            name: 'move_down',
            callback: function(options) {
                if(options?.character?.velocity?.y != null) {
                    options.character.velocity.y = 1;
                }
            }
        });

        new Action({
            name: 'move_left',
            callback: function(options) {
                if(options?.character?.velocity?.x != null) {
                    options.character.velocity.x = -1;
                }
            }
        });

        new Action({
            name: 'move_right',
            callback: function(options) {
                if(options?.character?.velocity?.x != null) {
                    options.character.velocity.x = 1;
                }
            }
        });

        new Action({
            name: 'attack',
            callback: function(options) {
                // TODO: Pull in enum from technology class
                const eqipped = options?.character?.equipment?.attack;
                if(eqipped == null) {
                    console.log("Character has no attack skill equipped!");
                    return;
                }

                // TODO: This isn't going to track a per-character last action time. We need that.
                if(!this.checkDelay(eqipped)) return;

                if(!this.inRange(eqipped, options.character)) return;

                // TODO: visual and audio cues
                if(options?.character?.target) {
                    options.character.target.health -= eqipped.damage;
                }
            }
        });

        // maybe not allowed to do this yet
        new Action({
            name: 'subdivide',
            // TODO: Maybe we should just have "on press" vs "on held" ...
            oncePerPress: true,
            callback: function(options) {
                options.character.Subdivide();
            }
        })

        // TODO: unavailable if a subdivided piece is already studying
        new Action({
            name: 'study',
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function(options) {

                const piece = options.character.Subdivide({
                    purpose: Character.Purposes["study"],
                    target: Action.List["study"].target
                });
            }
        });

        // TODO: unavailable if a subdivided piece is already nomming
        new Action({
            name: 'consume',
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function(options) {

                const piece = options.character.Subdivide({
                    purpose: Character.Purposes["consume"],
                    target: Action.List["consume"].target
                });
            }
        });
    }

    constructor(options = {}) {

        super(options);

        if(this.callback) {
            const baseCallback = this.callback;

            this.callback = function(options = {}) {

                if(!Requirements.met(this, options.character)) return;

                if(!this.checkDelay(this)) return;

                baseCallback.bind(this)(options);
            }
        }
    }

    checkDelay(thing) {

        if(thing.delay && this.lastFired && 
            performance.now() - this.lastFired < thing.delay) return false;
        else if(thing.delay) this.lastFired = performance.now();

        return true;
    }

    inRange(thing, character) {

        if(thing.range) {
            if(!character?.target) return false;

            if(character.getDistance(character.target) > thing.range) return false;
        }

        return true;
    }
}
