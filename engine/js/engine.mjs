import Camera from './camera.mjs';
import Seed from './core/seed.mjs';
import Client from './network/client.mjs';
import Events from './events.mjs';

const Game = {
    Camera: new Camera(),
    Seed: new Seed(123456),
    Timings: {
        FirstLoad: performance.now()
    },
    Map: null,  // TODO: fix needing this...
};

export default Game;

const playfield = document.createElement("div")
playfield.id = "playfield";
document.body.appendChild(playfield);

Events.Subscribe(Events.List.GameStart, function() {
    Game.Timings.GameStart = performance.now();
});
