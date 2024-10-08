import CharacterType from './CharacterType';
import Events from '../../engine/js/events';
import Chunk, { ChunkEvent } from '../../engine/js/mapping/chunk';
import { MakeHiveMindCharacter } from './character/HivemindCharacterFactory';
import { GrowableConfig, MakeGrowable } from './character/mixins/Growable';
import { LivingOptions, MakeLiving } from '../../engine/js/entities/character/mixins/Living';
import MakeCharacterType from './CharacterTypeFactory';
import { EntityOptions } from '../../engine/js/entities/character/EntityOptions';

// need a definition for character types
// so the player can study the type and learn how to gain health from it

MakeCharacterType({
    name: 'Food',
    research: {
        cost: 10
    },
    context: {
        color: 'green',
        health: 5,
        ai: null
    }
});

// we probably should be creating spawners.
// spawners should be able to be generic
export default class Food {
    
    static {

        Events.Subscribe(Events.List.ChunkCreated, this.spawnFood.bind(this));
    }

    static spawnFood(event: ChunkEvent) {

        const chunk = event.chunk;
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
    
                const opts: GrowableConfig & LivingOptions & EntityOptions = {
                    characterType: CharacterType.List['Food'],
                    position: {
                        x: spawnerPosition.x + offsetX,
                        y: spawnerPosition.y + offsetY
                    }
                };
                
                MakeHiveMindCharacter([MakeGrowable, MakeLiving], opts);
            }
        }
    }
}
