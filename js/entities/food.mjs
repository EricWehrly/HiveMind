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

const number_of_food_spawn_points = 5;
const food_per_spawn_min = 2;
const food_per_spawn_max = 5;

Events.Subscribe(Events.List.GameStart, function() {     

    for (var i = 0; i < number_of_food_spawn_points; i++) {

        const spawnerPosition = {
            x: Math.randomBetween(4, 40),
            y: Math.randomBetween(4, 20),
        }
        const amountToSpawn = Math.randomBetween(food_per_spawn_min, food_per_spawn_max);
        for(var i2 = 0; i2 < amountToSpawn; i2++) {
            const offsetX = Math.randomBetween(-3, 3);
            const offsetY = Math.randomBetween(-3, 3);

            const opts = {
                position: {
                    x: spawnerPosition.x + offsetX,
                    y: spawnerPosition.y + offsetY
                }
            };
            
            Object.assign(opts, CharacterType.Apple);
            new Character(opts);
        }
    }
});