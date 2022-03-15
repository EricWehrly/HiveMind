// these actions should really be in the game, not the engine
import Character from '../../js/entities/character-extensions.mjs';

const Actions = {};
export default Actions;

class Action {

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
            callback: function(options) {

                const piece = options.character.Subdivide({
                    // this?
                    purpose: Character.Purposes["study"],
                    target: Actions["study"].target
                });
            }
        });
    }

    constructor(options) {

        Object.assign(this, options);

        Actions[options.name] = this;
    }
}


// module.exports = Actions;