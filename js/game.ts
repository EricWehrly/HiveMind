// Core
import Game from '../engine/js/engine.mjs';
import Events from '../engine/js/events.mjs';

// Data
import './data/biomeTypes.mjs'

// Functionality
import '../engine/js/mapping/tile-manager.mjs';
import KeyboardController from './controls/keyboard-controller.mjs';
import Character from './entities/character-extensions.mjs';
// import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import ToolTip from '../engine/js/ui/tooltip.mjs';
// import Action from '../engine/js/action.mjs';
import Technology from '../engine/js/technology.mjs';
// import Menu from '../engine/js/ui/menu.mjs';
import './ui/ui.mjs';
import '../engine/js/ui/ui-equipment.mjs';
import '../engine/js/ui/ui-resource.mjs';

import Map from '../engine/js/mapping/map';
import './entities/entities.mjs';
// TODO: We can restructure 'entities.js' to import and export this
import Resource from '../engine/js/entities/resource.mjs';
import './characterStats.mjs';

import Cheat from './util/cheat.mjs';
import MessageLog from '../engine/js/core/messageLog.mjs';
import "./goal.ts";

// hack, until we convert Actions to proper ts
import './interaction.mjs';

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

Game.Map = new Map(Game.Seed);

// TODO: figure out where to properly put this
declare global {
    interface Window {
        LOCAL_PLAYER: Character;
        Game: typeof Game
    }
}

const food = new Resource({
    name: "food",
    value: 100
});
// keep 100 food in reserve for the player to work with
// maybe this number should scale over time
food.reserve(100);
const slap = Technology.Get("slap");

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

const gameStartOptions = {
    finalFire: true,
    // TODO: make these properly optional
    removeAfterRaise: false,
    isNetworkBoundEvent: false,
    isNetworkOriginEvent: false
};
Events.RaiseEvent(Events.List.GameStart, null, gameStartOptions);

Game.Camera.setTarget(localPlayer);

window.Game = Game;

Cheat.Beefcake;
