import Character from './character-extensions.mjs';
import Technology from '../../engine/js/technology.mjs';
import Events from '../../engine/js/events.mjs';
import CharacterType from './characterType.mjs';
import Chunk from '../../engine/js/mapping/chunk.mjs';

new CharacterType({
    name: "Animal",
    color: 'red',
    health: 40,
});

// we may as well spawn "fauna", too, while we're at it
// why don't we just have fauna have aggression from 0 to 100?
function spawnFauna(chunk) {

    const seed = chunk.seed;

    const claws = Technology.Get("claws");
    const characterOpts = Object.assign({}, CharacterType.Animal);
    characterOpts.technologies = [claws];
    
    // const spawnCount = seed.Random(0, 1) * 5;
    // later, we can use the remainder to make monsters stronger
    const spawnCount = Math.ceil(chunk.danger);
    // how much aggression?
    // later, the amount of aggression in the chunk can gate certain creatures from spawning
    // later, the amount of "points" (strength) a monster has should be used to determine if they get a technology like claws
    // things like 'claws' should be technoligies of escalating power assigned to monsters based on 

    console.log(`Spawning ${spawnCount} enemies for chunk ${chunk.x}, ${chunk.y}`);
    for(var i = 0; i < spawnCount; i++) {

        characterOpts.aggression = seed.Random(0, chunk.hostility);

        const chunkX = chunk.x * Chunk.CHUNK_SIZE;
        const chunkY = chunk.y * Chunk.CHUNK_SIZE;
        const randomX = seed.Random(0, Chunk.CHUNK_SIZE - 1);
        const randomY = seed.Random(0, Chunk.CHUNK_SIZE - 1);
        const spawnOpts = {
            x: chunkX + randomX,
            y: chunkY + randomY
        };
        console.log(`at ${spawnOpts.x}, ${spawnOpts.y}`);
        Object.assign(spawnOpts, characterOpts);
        new Character(spawnOpts);
    }

    // from chunk seed:
    // how many to spawn
    // aggression for each
}

Events.Subscribe(Events.List.ChunkCreated, spawnFauna);
