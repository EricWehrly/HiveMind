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

import Map from '../engine/js/mapping/map.mjs';
import './entities/food.mjs';
import './entities/buildings.mjs';
import './entities/enemies.mjs';
import './entities/buildings.mjs';

// let someTile = new Tile();
// TODO: when this file gets maybe ~200 lines, we can move all the setup to '/js/game/game-setup.js'
KeyboardController.AddDefaultBinding("subdivide", "q");
// TODO: this needs to be a more generic 'interact' with specific functions, maybe like how attack works
// KeyboardController.AddDefaultBinding("interact", "f");
KeyboardController.AddDefaultBinding("study", "f");
KeyboardController.AddDefaultBinding("consume", "f");

// still 'interact' ... depends on what has focus right now ...
KeyboardController.AddDefaultBinding("menu_interact", "f");
KeyboardController.AddDefaultBinding("buildMenu", "b");

const map = new Map();

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

// half of this is "compute local player tooltip"
// the other half is toggling the current action ...
function checkPlayerInteraction() {

    // if a menu is active,
    // clear player tooltip and return

    const closest = localPlayer.target;
    const characterType = closest != null ?  closest.characterType : null;

    let toolTipMessage = '';
    if(closest?.name) {
        toolTipMessage = closest.name + '<br />';
    }

    if(closest != null && closest.canBeStudied) {
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
        Action.List["study"].enabled = true;
        toolTipMessage += "'F' - Study";
        localPlayer.toolTip.entity = closest;
    } else {
        Action.List["study"].enabled = false;
                
        // for some reason we can fire off a consume and a study at the same time?
        if(characterType && CharacterType[characterType].isStudied
            && !closest.isGrown) {
            Action.List["consume"].target = closest;
            Action.List["consume"].enabled = true;
            toolTipMessage += "'F' - Nom";            
        } else {
            localPlayer.toolTip.entity = closest;
        }
    }

    localPlayer.toolTip.message = toolTipMessage;
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
Character.LOCAL_PLAYER = localPlayer;

localPlayer.AddTechnology(slap);

localPlayer.toolTip = new ToolTip({
    entity: localPlayer
});

Game.Camera.setTarget(localPlayer);

// we can limit this to when local player moves
// this implementation is lazy but should technically work fine
RegisterLoopMethod(checkPlayerInteraction, false);

console.log('Starting game.');
