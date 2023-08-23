import Game from '../engine/js/engine.mjs';
import Events from '../engine/js/events.mjs';

import TileManager from '../engine/js/mapping/tile-manager.mjs';
import KeyboardController from './controls/keyboard-controller.mjs';
import Character from './entities/character-extensions.mjs';
import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import ToolTip from '../engine/js/ui/tooltip.mjs';
import Action from '../engine/js/action.mjs';
import Technology from '../engine/js/technology.mjs';
import CharacterType from './entities/characterType.mjs';
import UI from './ui/ui.mjs';
import * as uiEquipment from '../engine/js/ui/ui-equipment.mjs';
import * as uiResource from '../engine/js/ui/ui-resource.mjs';

import Map from '../engine/js/mapping/map.mjs';
import './entities/entities.mjs';
// TODO: We can restructure 'entities.js' to import and export this
import Resource from '../engine/js/entities/resource.mjs';

import Cheat from './cheat.mjs';

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

Game.Map = new Map();

new Resource({
    name: "food"
});
const slap = Technology.Get("slap");

// half of this is "compute local player tooltip"
// the other half is toggling the current action ...
function checkPlayerInteraction() {

    // if a menu is active,
    // clear player tooltip and return

    const closest = localPlayer.target;
    const characterType = closest != null ?  closest.characterType : null;

    if(closest?.canBeStudied) {
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
        Action.List["study"].enabled = true;
        localPlayer.toolTip.entity = closest;
    } else {
        Action.List["study"].enabled = false;
                
        // for some reason we can fire off a consume and a study at the same time?
        if(characterType && CharacterType[characterType].isStudied
            && !closest.isGrown) {
            Action.List["consume"].target = closest;
            Action.List["consume"].enabled = true; 
        } else {
            localPlayer.toolTip.entity = closest;
        }
    }

    localPlayer.toolTip.message = closest?.toolTipMessage || '';
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

window.Game = Game;
console.log('Starting game.');
