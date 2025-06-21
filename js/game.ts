// Core
import Game from '../engine/js/main';
import Events from '../engine/js/events';

// Data
import './data/biomeTypes'

// Functionality
import KeyboardController from './controls/KeyboardController';
import HiveMindCharacter from './entities/character/HiveMindCharacter';
import { MakeSlimey } from './entities/character/mixins/Slimey';
import { MakeHiveMindCharacter } from './entities/character/HivemindCharacterFactory';
import ToolTip from '../engine/js/ui/tooltip';
import './ui/ui';
// weirdly we've removed any other imports for this ...
import './entities/building';

import GameMap from '../engine/js/mapping/GameMap';
import './entities/entities';
import Resource from '../engine/js/entities/resource';

import Cheat from './util/cheat';
import MessageLog, { RETENTION_STRATEGY } from '../engine/js/core/MessageLog';

// hack, until we convert Actions to proper ts
import './actions';
import './interaction';
import './entities/purposes/CharacterPurposes';
import { LivingOptions, MakeLiving } from '../engine/js/entities/character/mixins/Living';
import { Equipped, MakeEquipped } from '../engine/js/entities/character/mixins/Equipped';
import { CombativeOptions, MakeCombative } from '../engine/js/entities/character/mixins/Combative';
import { MakeGrower } from './entities/character/mixins/Grower';

import './characterStats';
import "./ui/goal";
import { MakePlayable, PlayableOptions } from '../engine/js/entities/character/mixins/Playable';
import PlayerAI from '../engine/js/ai/Player';
import { MakeSentient, SentientOptions } from '../engine/js/entities/character/mixins/Sentient';
import { EntityOptions } from '../engine/js/entities/character/EntityOptions';
import Technology from '../engine/js/technology';

// audio
import './audio/AudioSetup';

new MessageLog({
    name: "Combat",
    retentionStrategy: RETENTION_STRATEGY.MESSAGE_COUNT,
    maxMessages: 5
});

KeyboardController.AddDefaultBinding("subdivide", "q");
// TODO: this needs to be a more generic 'interact' with specific functions, maybe like how attack works
// KeyboardController.AddDefaultBinding("interact", "f");
KeyboardController.AddDefaultBinding("study", "f");
KeyboardController.AddDefaultBinding("consume", "f");

// still 'interact' ... depends on what has focus right now ...
KeyboardController.AddDefaultBinding("menu_interact", "f");

Game.GameMap = new GameMap(Game.Seed);

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

const options: EntityOptions & SentientOptions & PlayableOptions & LivingOptions
    & { additionalClasses: string} = {
    name: "Local Player",
    color: "blue",
    health: 40,
    additionalClasses: "player",
    ai: PlayerAI,
    isPlayer: true,
    attributes: {
        speed: 5
    }
}
const localPlayer = MakeHiveMindCharacter([MakePlayable, MakeSlimey, MakeGrower, MakeLiving, MakeEquipped, MakeCombative, MakeSentient], options) as HiveMindCharacter & Equipped;
localPlayer.controller = new KeyboardController({ character: localPlayer });
window.LOCAL_PLAYER = localPlayer;

const slap = Technology.Get("slap");
localPlayer.AddTechnology(slap);

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
    // hack to force Playable.afterMove to fire Events.List.PlayerChunkChanged
    localPlayer.SetDesiredMovementVector(0, -.0000001);
    localPlayer.move(.0001);
}
Events.Subscribe(Events.List.DataLoaded, startGame);

Events.RaiseEvent(Events.List.ScriptsLoaded, null, { finalFire: true });
// TODO: establish proper data loading
Events.RaiseEvent(Events.List.DataLoaded, null, { finalFire: true });

window.Game = Game;
