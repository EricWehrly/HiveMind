// Core
import Game from '../engine/js/engine.mjs';
import Events from '../engine/js/events.mjs';

// Data
import './data/biomeTypes.mjs'

// Functionality
import TileManager from '../engine/js/mapping/tile-manager.mjs';
import KeyboardController from './controls/keyboard-controller.mjs';
import Character from './entities/character-extensions.mjs';
import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import ToolTip from '../engine/js/ui/tooltip.mjs';
import Action from '../engine/js/action.mjs';
import Technology from '../engine/js/technology.mjs';
import Menu from '../engine/js/ui/menu.mjs';
import UI from './ui/ui.mjs';
import * as uiEquipment from '../engine/js/ui/ui-equipment.mjs';
import * as uiResource from '../engine/js/ui/ui-resource.mjs';

import Map from '../engine/js/mapping/map.mjs';
import './entities/entities.mjs';
// TODO: We can restructure 'entities.js' to import and export this
import Resource from '../engine/js/entities/resource.mjs';
import './characterStats.mjs';

import Cheat from './cheat.mjs';
import MessageLog from '../engine/js/core/messageLog.mjs';

new MessageLog({
    name: "Combat",
    retentionStrategy: MessageLog.RETENTION_STRATEGY.MESSAGE_COUNT,
    maxMessages: 5
});

KeyboardController.AddDefaultBinding("subdivide", "q");
// TODO: this needs to be a more generic 'interact' with specific functions, maybe like how attack works
// KeyboardController.AddDefaultBinding("interact", "f");
KeyboardController.AddDefaultBinding("study", "f");
KeyboardController.AddDefaultBinding("consume", "f");

// still 'interact' ... depends on what has focus right now ...
KeyboardController.AddDefaultBinding("menu_interact", "f");

Game.Map = new Map();

new Resource({
    name: "food"
});
const slap = Technology.Get("slap");

function checkPlayerInteraction() {

    if(Menu.anyOpen) {

        localPlayer.toolTip.entity = null;
        localPlayer.toolTip.visible = false;
        // localPlayer.toolTip.message = '';
        return;
    }

    const closest = localPlayer.target;

    if(closest == null) return;
    localPlayer.toolTip.entity = closest;

    if(closest.canBeStudied == undefined) debugger;

    // maybe actions could have a "check condition" ?
    if(closest.canBeStudied(localPlayer)) {
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
        Action.List["study"].enabled = true;
    } else {
        Action.List["study"].enabled = false;
    }

    if(closest.canBeEaten(localPlayer)) {
        Action.List["consume"].target = closest;
        Action.List["consume"].enabled = true;
    } else {        
        Action.List["consume"].enabled = false;
    }

    localPlayer.toolTip.message = closest.toolTipMessage || '';
}

const localPlayer = new Character({
    name: "Local Player",
    color: "blue",
    speed: 5,
    health: 40,
    additionalClasses: "player",
    ai: null,
    isPlayer: true
});
localPlayer.controller = new KeyboardController({ character: localPlayer });
Character.LOCAL_PLAYER = localPlayer;
window.LOCAL_PLAYER = localPlayer;

localPlayer.AddTechnology(slap);

localPlayer.toolTip = new ToolTip({
    entity: localPlayer
});

const gameStartOptions = {finalFire: true };
Events.RaiseEvent(Events.List.GameStart, null, gameStartOptions);

Game.Camera.setTarget(localPlayer);

// we can limit this to when local player moves
// this implementation is lazy but should technically work fine
RegisterLoopMethod(checkPlayerInteraction, false);

window.Game = Game;

Cheat.Beefcake;
