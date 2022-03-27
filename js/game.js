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
import ToolTip from '../engine/js/ui/tooltip.mjs';
import Action from '../engine/js/action.mjs';
import Technology from '../engine/js/technology.mjs';

import './entities/food.mjs';
import './entities/enemies.mjs';

// let someTile = new Tile();
KeyboardController.AddDefaultBinding("subdivide", "q");
KeyboardController.AddDefaultBinding("study", "f");

const localPlayer = new Character({
    name: "Local Player",
    color: "blue",
    speed: 5,
    health: 100,
    additionalClasses: "player",
    ai: null,
    isPlayer: true
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

localPlayer.toolTip = new ToolTip({
    entity: localPlayer
});

function checkPlayerInteraction() {

    const closest = localPlayer.target;

    if(closest != null && closest.canBeStudied) {
        localPlayer.toolTip.message = "'F' - Study";
    } else localPlayer.toolTip.message = "";

    // have the tooltip follow the player if there's an active messqage
    // this check can set the message

    /*
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
    */
}

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');
