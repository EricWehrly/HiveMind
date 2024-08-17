// Core
import Game from '../engine/js/main';
import Events from '../engine/js/events';

// Data
import './data/biomeTypes'

// Functionality
import '../engine/js/mapping/tile-manager';
import KeyboardController from './controls/keyboard-controller.mjs';
import Character from '../engine/js/entities/character';
import HiveMindCharacter from './entities/character/HiveMindCharacter';
import { MakeSlimey } from './entities/character/mixins/Slimey';
import { MakeHiveMindCharacter } from './entities/character/HivemindCharacterFactory';
// import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import ToolTip from '../engine/js/ui/tooltip';
import Technology from '../engine/js/technology';
// import Menu from '../engine/js/ui/menu.mjs';
import './ui/ui';
import '../engine/js/ui/ui-equipment';
import '../engine/js/ui/ui-resource.mjs';
// weirdly we've removed any other imports for this ...
import './entities/building';

import Map from '../engine/js/mapping/map';
import './entities/entities.mjs';
// TODO: We can restructure 'entities.js' to import and export this
import Resource from '../engine/js/entities/resource';
import './characterStats';

import Cheat from './util/cheat';
import MessageLog from '../engine/js/core/messageLog.mjs';
import "./goal.ts";
import '../engine/js/rendering/entities/entity-graphics';
import '../engine/js/rendering/ui/ui-element-renderer';
import '../engine/js/rendering/ui/equipment-renderer';
import '../engine/js/rendering/mapping/chunk-graphic';

// hack, until we convert Actions to proper ts
import './actions';
import './interaction';
import './entities/purposes/slime-purposes';
import './entities/purposes/growth-purposes';
import { MakeLiving } from '../engine/js/entities/character/mixins/Living';
import { Equipped, MakeEquipped } from '../engine/js/entities/character/mixins/Equipped';
import { MakeCombative } from '../engine/js/entities/character/mixins/Combative';
import { MakeGrower } from './entities/character/mixins/Grower';

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
        [key: string]: any;
        LOCAL_PLAYER: HiveMindCharacter;
        Game: typeof Game;
    }
}

const food = new Resource({
    name: "food",
    value: 100
});
// keep 100 food in reserve for the player to work with
// maybe this number should scale over time
food.reserve(100, {});

const localPlayer = MakeHiveMindCharacter([MakeSlimey, MakeGrower, MakeLiving, MakeEquipped, MakeCombative], {
    name: "Local Player",
    color: "blue",
    speed: 5,
    health: 40,
    additionalClasses: "player",
    ai: null,
    isPlayer: true
}) as HiveMindCharacter & Equipped;
localPlayer.controller = new KeyboardController({ character: localPlayer });
Character.LOCAL_PLAYER = localPlayer;
window.LOCAL_PLAYER = localPlayer;

localPlayer.AddTechnology("slap");

localPlayer.toolTip = new ToolTip({
    entity: localPlayer
});

Game.Camera.setTarget(localPlayer);

function startGame() {
    const gameStartOptions = {
        finalFire: true,
        // TODO: make these properly optional
        removeAfterRaise: false,
        isNetworkBoundEvent: false,
        isNetworkOriginEvent: false
    };
    Events.RaiseEvent(Events.List.GameStart, null, gameStartOptions);
    Cheat.Beefcake;
}
Events.Subscribe(Events.List.DataLoaded, startGame);

Events.RaiseEvent(Events.List.ScriptsLoaded, null, { finalFire: true });
// TODO: establish proper data loading
Events.RaiseEvent(Events.List.DataLoaded, null, { finalFire: true });

window.Game = Game;
