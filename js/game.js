import managedImport from './util/managed-import.js';

await managedImport('../engine/js/util/custom-style.js');

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
// eventually if we keep building this out, we should create a dividing line between the 'game' and the 'game engine'
// and import the latter from a separate repository
// const Tile = await managedImport('../engine/js/mapping/tile.mjs');
const TileManager = await managedImport('../engine/js/mapping/tile-manager.mjs');
const Character = await managedImport('../engine/js/entities/character.mjs');
const KeyboardController = await managedImport('./controls/keyboard-controller.mjs');
import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import { GetClosestEntity } from '../engine/js/entities/characters.mjs';
import ToolTip from '../engine/js/ui/tooltip.mjs';
import Actions from '../engine/js/action.mjs';

// let someTile = new Tile();

// TODO: set character current subdivision task/purpose
Character.prototype.subdivide = function(amount, purpose) {
    console.log("amount, purpose");
}

const localPlayer = new Character({
    name: "Local Player",
    color: 'blue',
    speed: 5,
    health: 100
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

    const closest = GetClosestEntity(localPlayer, 5);
    if(closest && closest.technologies) {
        new ToolTip(closest.technologies[0]);
        // console.log(closest.technologies);
        Actions["study"].enabled = true;
    }
    else Actions["study"].enabled = false;
}

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');