import Technology from '../../engine/js/technology';
import Events from '../../engine/js/events';
import CharacterType from './CharacterType';
import Chunk, { ChunkEvent } from '../../engine/js/mapping/chunk';
import PredatorAI from '../../engine/js/ai/predator';
import { MakeHiveMindCharacter } from './character/HivemindCharacterFactory';
import { MakeLiving } from '../../engine/js/entities/character/mixins/Living';
import { MakeCombative } from '../../engine/js/entities/character/mixins/Combative';
import { MakeEquipped } from '../../engine/js/entities/character/mixins/Equipped';
import MakeCharacterType from './CharacterTypeFactory';
import { MakeSentient } from '../../engine/js/entities/character/mixins/Sentient';

MakeCharacterType({
    name: "Animal",
    context: {
        color: 'red',
        health: 4,
    }
});

// can't declare these at file level because it's too early in lifecycle
// and this isn't really a class file, so :(
function getFaunaTechs() {

    return [
        Technology.Get("claws"),
        Technology.Get("projectile"),
        Technology.Get("thorns")
    ]
}

// we may as well spawn "fauna", too, while we're at it
// why don't we just have fauna have aggression from 0 to 100?
// need some kind of indicator like "redness" of the creature to show how dangerous / aggressive it is?
function spawnFauna(event: ChunkEvent) {

    const chunk = event.chunk;

    const seed = chunk.seed;

    const techs = getFaunaTechs();
    // const claws = Technology.Get("claws");
    const characterOpts = Object.assign({}, CharacterType.List['Animal']);
    // characterOpts.technologies = [claws];
    
    // later, we can use the remainder to make monsters stronger
    // const spawnCount = Math.ceil(chunk.danger * 0.8);
    // for now, simple equations
    const spawnCount = chunk.distance - 1;

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
        characterOpts.aggression = chunk.hostility;
        
        // need to allow for the possibility of 'no' techs (if fauna and not 'enemy')
        const techIndex = Math.round(seed.Random(0, techs.length - 1));

        const chunkX = chunk.x * Chunk.CHUNK_SIZE;
        const chunkY = chunk.y * Chunk.CHUNK_SIZE;
        const randomX = seed.Random(padding, (Chunk.CHUNK_SIZE / 2) - (padding + 1));
        const randomY = seed.Random(padding, (Chunk.CHUNK_SIZE / 2) - (padding + 1));
        const spawnOpts = {
            characterType: CharacterType.List['Animal'],
            position: {
                x: chunkX + (Chunk.CHUNK_SIZE / 2) + randomX,
                y: chunkY + (Chunk.CHUNK_SIZE / 2) + randomY
            },
            technologies: [ techs[techIndex] ],
            ai: PredatorAI
        };
        Object.assign(spawnOpts, characterOpts);
        MakeHiveMindCharacter([MakeLiving, MakeCombative, MakeEquipped, MakeSentient], spawnOpts);
    }
}

Events.Subscribe(Events.List.ChunkCreated, spawnFauna);
