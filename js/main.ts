import Camera from './camera';
import Seed from './core/seed';
import Events from './events';
import Map from './mapping/map';

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
