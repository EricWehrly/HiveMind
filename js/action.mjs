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
        })

        new Action({
            name: 'move_left',
            callback: function(options) {
                if(options?.character?.velocity?.x != null) {
                    options.character.velocity.x = -1;
                }
            }
        })

        new Action({
            name: 'move_right',
            callback: function(options) {
                if(options?.character?.velocity?.x != null) {
                    options.character.velocity.x = 1;
                }
            }
        })

        new Action({
            name: 'study',
            enabled: false,
            callback: function(options) {
                console.log("Break off a piece to study the thing!");
                console.log("consume the thing");
            }
        })
    }

    constructor(options) {

        this.callback = options.callback;

        Actions[options.name] = this;
    }
}


// module.exports = Actions;