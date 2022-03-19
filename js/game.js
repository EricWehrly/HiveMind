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
import Action from '../engine/js/action.mjs';
import Technology from '../engine/js/technology.mjs';

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

const slap = new Technology({
    name: "slap",
    type: Technology.Types.ATTACK,
    range: 2,
    damage: 1,
    delay: 3000
});

localPlayer.AddTechnology(slap);

const claws = new Technology({
    name: "claws",
    actions: [
        new Action({
            name: "claws",
            delay: 3000,
            requires: {
                technology: "claws"
            },
            callback: function(options) {
                console.log("CLAWS!");
            }
        })
    ]
});
KeyboardController.AddDefaultBinding("claws", " ");

// spawn an animal corpse to be studied (from which player can learn claws)
new Character({
    color: 'gray',
    health: 5,
    position: {
        x: 5,
        y: 5
    },
    technologies: [claws]
});

for (var i = 0; i < 3; i++) {
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

    const closest = GetClosestEntity(localPlayer, { limit: 5, filterChildren: true });
    if (closest && closest.technologies && closest.technologies.length > 0) {
        new ToolTip({
            position: closest.getScreenPosition(),
            message: closest.technologies[0].name
        });
        // console.log(closest.technologies);
        Action.List["study"].enabled = true;
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
    }
    else Action.List["study"].enabled = false;
}

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');
