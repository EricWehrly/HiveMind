import managedImport from './util/managed-import.js';

import Game from '../engine/js/engine.mjs';
import Events from '../engine/js/events.mjs';

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
import CharacterType from './entities/characterType.mjs';
import UI from './ui/ui.mjs';
import * as uiEquipment from '../engine/js/ui/ui-equipment.mjs';

import './entities/food.mjs';
import './entities/enemies.mjs';

// let someTile = new Tile();
KeyboardController.AddDefaultBinding("subdivide", "q");
// TODO: this needs to be a more generic 'interact' with specific functions, maybe like how attack works
KeyboardController.AddDefaultBinding("study", "f");
KeyboardController.AddDefaultBinding("consume", "f");

const slap = new Technology({
    name: "slap",
    type: Technology.Types.ATTACK,
    range: 2,
    damage: 10,
    delay: 3000,
    sound: 'audio/slap.mp3'
});

const claws = new Technology({
    name: "claws",
    type: Technology.Types.ATTACK,
    range: 3,
    damage: 3,
    delay: 4200
});

function checkPlayerInteraction() {

    const closest = localPlayer.target;
    const characterType = closest != null ?  closest.characterType : null;

    if(closest != null && closest.canBeStudied) {
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
        Action.List["study"].enabled = true;
        localPlayer.toolTip.message = "'F' - Study";
        localPlayer.toolTip.entity = closest;
    } else {
        Action.List["study"].enabled = false;
        localPlayer.toolTip.message = "";
                
        // for some reason we can fire off a consume and a study at the same time?
        if(characterType && CharacterType[characterType].isStudied) {
            Action.List["consume"].target = closest;
            Action.List["consume"].enabled = true;
            localPlayer.toolTip.message = "'F' - Nom";            
        }
    }
}

Events.RaiseEvent(Events.List.GameStart);

const localPlayer = new Character({
    name: "Local Player",
    color: "blue",
    speed: 5,
    health: 40,
    additionalClasses: "player",
    ai: null,
    isPlayer: true
});
new KeyboardController({ character: localPlayer });

localPlayer.AddTechnology(slap);

localPlayer.toolTip = new ToolTip({
    entity: localPlayer
});

Game.Camera.setTarget(localPlayer);

RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');