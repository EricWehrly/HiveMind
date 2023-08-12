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

// can't declare these at file level because it's too early in lifecycle
// and this isn't really a class file, so :(
function getFaunaTechs() {

    return [
        Technology.Get("claws"),
        Technology.Get("projectile")
    ]
}

// we may as well spawn "fauna", too, while we're at it
// why don't we just have fauna have aggression from 0 to 100?
// need some kind of indicator like "redness" of the creature to show how dangerous / aggressive it is?
function spawnFauna(chunk) {

    const seed = chunk.seed;

    const techs = getFaunaTechs();
    // const claws = Technology.Get("claws");
    const characterOpts = Object.assign({}, CharacterType.Animal);
    // characterOpts.technologies = [claws];
    
    // const spawnCount = seed.Random(0, 1) * 5;
    // later, we can use the remainder to make monsters stronger
    const spawnCount = Math.ceil(chunk.danger * 0.8);
    // how much aggression?
    // later, the amount of aggression in the chunk can gate certain creatures from spawning
    // later, the amount of "points" (strength) a monster has should be used to determine if they get a technology like claws
    // things like 'claws' should be technoligies of escalating power assigned to monsters based on 
    // let pointAllocation = chunk.danger * chunk.hostility;
    // console.log(`Chunk will have ${pointAllocation} points.`);

    // ok so somehow we want the chunk to have a number associated like a "pool" to draw from
    // (we should also probably make those calculations and assignments in here)
    // then the pool is used to pick how many enemies to face, and how strong

    // console.log(`Spawning ${spawnCount} enemies for chunk ${chunk.x}, ${chunk.y}`);
    for(var i = 0; i < spawnCount; i++) {

        const padding = 2;
        characterOpts.aggression = seed.Random(0, chunk.hostility);
        
        // need to allow for the possibility of 'no' techs (if fauna and not 'enemy')
        const techIndex = Math.round(seed.Random(0, techs.length - 1));

        const chunkX = chunk.x * Chunk.CHUNK_SIZE;
        const chunkY = chunk.y * Chunk.CHUNK_SIZE;
        const randomX = seed.Random(padding, Chunk.CHUNK_SIZE - (padding + 1));
        const randomY = seed.Random(padding, Chunk.CHUNK_SIZE - (padding + 1));
        const spawnOpts = {
            position: {
                x: chunkX + randomX,
                y: chunkY + randomY
            },
            technologies: [ techs[techIndex] ]
        };
        // console.log(`at ${spawnOpts.position.x}, ${spawnOpts.position.y}`);
        Object.assign(spawnOpts, characterOpts);
        new Character(spawnOpts);
    }

    // from chunk seed:
    // how many to spawn
    // aggression for each
}

Events.Subscribe(Events.List.ChunkCreated, spawnFauna);
