import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Events from '../../engine/js/events.mjs';
import Chunk from '../../engine/js/mapping/chunk.mjs';

// need a definition for character types
// so the player can study the type and learn how to gain health from it

new CharacterType({
    name: 'Food',
    color: 'green',
    health: 5,
    ai: null
});

export default class Food {

    // TODO: define this in the biome, once we define biomes
    static #number_of_food_spawn_points = 5;
    static #food_per_spawn_min = 2;
    static #food_per_spawn_max = 5;
    
    static {

        Events.Subscribe(Events.List.ChunkCreated, this.spawnFood.bind(this));
    }

    static spawnFood(chunk) {
    
        for (var i = 0; i < this.#number_of_food_spawn_points; i++) {
    
            const chunkX = chunk.x * Chunk.CHUNK_SIZE;
            const chunkY = chunk.y * Chunk.CHUNK_SIZE;
            const randomX = Math.randomBetween(1, Chunk.CHUNK_SIZE - 1);
            const randomY = Math.randomBetween(1, Chunk.CHUNK_SIZE - 1);
            const spawnerPosition = {
                x: chunkX + randomX,
                y: chunkY + randomY,
            }
            const amountToSpawn = Math.randomBetween(this.#food_per_spawn_min, this.#food_per_spawn_max);
            for(var i2 = 0; i2 < amountToSpawn; i2++) {
                const offsetX = Math.randomBetween(-3, 3);
                const offsetY = Math.randomBetween(-3, 3);
    
                const opts = {
                    position: {
                        x: spawnerPosition.x + offsetX,
                        y: spawnerPosition.y + offsetY
                    }
                };
                
                // Maybe we should have a "spawn item" shorthand function?
                // or maybe "character type" should be an option we can pass into the character constructor?
                Object.assign(opts, CharacterType.Food);
                new Character(opts);
            }
        }
    }
}
