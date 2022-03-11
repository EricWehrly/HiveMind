import managedImport from './util/managed-import.js';

await managedImport('./util/javascript-extensions.js');
await managedImport('./util/custom-style.js');

import { RegisterLoopMethod } from './loop.mjs';
import { GetClosestEntity } from './entities/characters.mjs';

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
// eventually if we keep building this out, we should create a dividing line between the 'game' and the 'game engine'
// and import the latter from a separate repository
const Tile = await managedImport('./mapping/tile.mjs');
const TileManager = await managedImport('./mapping/tile-manager.mjs');
const Character = await managedImport('./entities/character.mjs');
const KeyboardController = await managedImport('./controls/keyboard-controller.mjs');

let someTile = new Tile();

const localPlayer = new Character({
    color: 'blue',
    speed: 10
});
new KeyboardController({ character: localPlayer });

// spawn an animal corpse to be studied (from which player can learn claws
new Character({
    color: 'gray',
    position: {
        x: 10,
        y: 10
    },
    technologies: [ 'claws' ]
});

for(var i = 0; i < 3; i++) {
    // spawn food
}

function checkPlayerInteraction() {

    const closest = GetClosestEntity(localPlayer);
    if(closest.technologies) {
        // console.log(closest.technologies);
    }
}

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');