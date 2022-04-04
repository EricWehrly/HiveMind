import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Events from '../../engine/js/events.mjs';

// need a definition for character types
// so the player can study the type and learn how to gain health from it

new CharacterType({
    name: 'Apple',
    color: 'green',
    health: 5,
    ai: null
});

Events.Subscribe(Events.List.GameStart, function() {     

    for (var i = 0; i < 3; i++) {
        // random x and y within some range, on positive axis
        let opts = {
            position: {
            x: Math.random() * 10,
            y: Math.random() * 10
            }
        };
        
        Object.assign(opts, CharacterType.Apple);
        new Character(opts);
    }
});