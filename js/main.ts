import Camera from './camera';
import Seed from './core/seed';
import Events from './events';
import Map from './mapping/map';

// functionality
import './mapping/tile-manager';

// hack to fix a dumb error caused by subscription to not-yet-declared event in ui-equipment
import './entities/equipment';
// and the same error again at the end of ui-equipment
import './entities/character/mixins/Combative';

// ui
// we could change so that the root 'engine/ui/' index does the imports (and returns the current "UI" object)
// but that doesn't buy us much, besides grouping the following two imports in a parent
// and that's not worth much
import './ui/ui-equipment';
import './ui/ui-resource.mjs';

// rendering
import './rendering/entities/entity-graphics';
import './rendering/ui/ui-element-renderer';
import './rendering/ui/equipment-renderer';
import './rendering/mapping/chunk-graphic';

const Game = {
    Camera: new Camera(),
    Seed: new Seed(123456),
    Timings: {
        FirstLoad: performance.now(),
        GameStart: -1
    },
    Map: null as Map | null,  // TODO: fix needing this...
};

export default Game;

const playfield = document.createElement("div")
playfield.id = "playfield";
document.body.appendChild(playfield);

Events.Subscribe(Events.List.GameStart, function() {
    Game.Timings.GameStart = performance.now();
});
