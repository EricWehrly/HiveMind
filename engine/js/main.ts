import Camera from './camera';
import Seed from './core/seed';
import Events from './events';
import GameMap from './mapping/GameMap';

// functionality
import './mapping/tile-manager';

// entities
import './entities/characters';

// hack to fix a dumb error caused by subscription to not-yet-declared event in ui-equipment
import './entities/equipment';
// and the same error again at the end of ui-equipment
import './entities/character/mixins/Combative';

// audio
import './audio/AudioSetup';

// ui
// we could change so that the root 'engine/ui/' index does the imports (and returns the current "UI" object)
// but that doesn't buy us much, besides grouping the following two imports in a parent
// and that's not worth much
import './ui/ui-equipment';
import './ui/ui-resource';

// establish rendering contexts
// (eventually, we want the game itself to do this)
import DomRenderingContext from './rendering/contexts/DomRenderingContext';
import CanvasRenderingContext from './rendering/contexts/CanvasRenderingContext';

// rendering
import './rendering/entities/entity-graphics';
import './rendering/ui/ui-element-renderer';
import './rendering/ui/ui-menu-renderer';
import './rendering/ui/equipment-renderer';
import './rendering/mapping/chunk-graphic';
import './rendering/LaserProjectile.renderer';

const Game = {
    Camera: new Camera(),
    Seed: new Seed(123456),
    Timings: {
        FirstLoad: performance.now(),
        GameStart: -1
    },
    GameMap: GameMap.Instance
};

export default Game;

new DomRenderingContext();
new CanvasRenderingContext();

Events.Subscribe(Events.List.GameStart, function() {
    Game.Timings.GameStart = performance.now();
});
