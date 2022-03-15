import managedImport from './util/managed-import.js';

import Game from '../engine/js/engine.mjs';

await managedImport('../engine/js/util/custom-style.js');

// const tileFile = `./tile.mjs?ver=${performance.now()}`;
// const Tile = await import(tileFile);
// import Tile from './tile.mjs';
// eventually if we keep building this out, we should create a dividing line between the 'game' and the 'game engine'
// and import the latter from a separate repository
// const Tile = await managedImport('../engine/js/mapping/tile.mjs');
const TileManager = await managedImport('../engine/js/mapping/tile-manager.mjs');
const KeyboardController = await managedImport('./controls/keyboard-controller.mjs');
import Character from './entities/character-extensions.mjs';
import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import { GetClosestEntity } from '../engine/js/entities/characters.mjs';
import ToolTip from '../engine/js/ui/tooltip.mjs';
import Actions from '../engine/js/action.mjs';

// let someTile = new Tile();
KeyboardController.AddDefaultBinding("subdivide", "q");
KeyboardController.AddDefaultBinding("study", "f");

const localPlayer = new Character({
    name: "Local Player",
    color: null,
    speed: 5,
    health: 100,
    additionalClasses: "player"
});
new KeyboardController({ character: localPlayer });

// spawn an animal corpse to be studied (from which player can learn claws)
new Character({
    color: 'gray',
    health: 40,
    position: {
        x: 5,
        y: 5
    },
    technologies: [ 'claws' ]
});

for(var i = 0; i < 3; i++) {
    // random x and y within some range, on positive axis
    let x = Math.random() * 100;
    let y = Math.random() * 100;
    // spawn food
    new Character({
        color: 'green',
        position: {
            x: x,
            y: y
        }
    });
}

function checkPlayerInteraction() {

    const closest = GetClosestEntity(localPlayer, 5);
    if(closest && closest.technologies) {
        new ToolTip({
            position: closest.getScreenPosition(),
            message: closest.technologies[0]
        });
        // console.log(closest.technologies);
        Actions["study"].enabled = true;
        // this only works with 1 local player cause actions will be local to this system ...
        Actions["study"].target = closest;
    }
    else Actions["study"].enabled = false;
}

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');