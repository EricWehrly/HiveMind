import CharacterType from './CharacterType.ts';
import Events from '../../engine/js/events.ts';
import Chunk from '../../engine/js/mapping/chunk.ts';
import Game from '../../engine/js/engine.mjs';
import { MakeHiveMindCharacter } from './character/HivemindCharacterFactory.ts';
import { MakeGrowable } from './character/mixins/Growable.ts';
import { MakeLiving } from '../../engine/js/entities/character/mixins/Living.ts';

const Seed = Game.Seed;

// need a definition for character types
// so the player can study the type and learn how to gain health from it

new CharacterType({
    name: 'Food',
    color: 'green',
    health: 5,
    ai: null,
    research: {
        cost: 10
    }
});

// we probably should be creating spawners.
// spawners should be able to be generic
export default class Food {
    
    static {

        Events.Subscribe(Events.List.ChunkCreated, this.spawnFood.bind(this));
    }

    static spawnFood(chunk) {

        const seed = chunk.seed;
        
        const food_per_spawn_min = seed.Random(0, chunk.flora / 4);
        const food_per_spawn_max = seed.Random(chunk.flora / 4, chunk.flora);
        const number_of_food_spawn_points = seed.Random(0, 1) * 5;
    
        for (var i = 0; i < number_of_food_spawn_points; i++) {
    
            const chunkX = chunk.x * Chunk.CHUNK_SIZE;
            const chunkY = chunk.y * Chunk.CHUNK_SIZE;
            const randomX = Math.randomBetween(1, (Chunk.CHUNK_SIZE / 2) - 1);
            const randomY = Math.randomBetween(1, (Chunk.CHUNK_SIZE / 2) - 1);
            const spawnerPosition = {
                x: chunkX + (Chunk.CHUNK_SIZE / 2) + randomX,
                y: chunkY + (Chunk.CHUNK_SIZE / 2) + randomY,
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
                
                // Maybe we should have a "spawn item" shorthand function?
                // or maybe "character type" should be an option we can pass into the character constructor?
                Object.assign(opts, CharacterType.List['Food']);
                opts.characterType = CharacterType.List['Food'];
                MakeHiveMindCharacter([MakeGrowable, MakeLiving], opts);
            }
        }
    }
}
