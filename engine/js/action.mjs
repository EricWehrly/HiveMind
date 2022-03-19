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

        // maybe not allowed to do this yet
        new Action({
            name: 'subdivide',
            // TODO: Maybe we should just have "on press" vs "on held" ...
            oncePerPress: true,
            callback: function(options) {
                options.character.Subdivide();
            }
        })

        new Action({
            name: 'study',
            enabled: false,
            oncePerPress: true,
            delay: 1000,
            callback: function(options) {

                const piece = options.character.Subdivide({
                    // this?
                    purpose: Character.Purposes["study"],
                    target: Action.List["study"].target
                });
            }
        });

        // new action for claws if player has the technology
    }

    constructor(options = {}) {

        super(options);

        if(this.callback) {
            const baseCallback = this.callback;

            this.callback = function(options = {}) {

                if(!Requirements.met(this, options.character)) return;

                if(this.delay && this.lastFired && 
                    performance.now() - this.lastFired < this.delay) return;
                else if(this.delay) this.lastFired = performance.now();

                baseCallback(options);
            }
        }
    }
}
