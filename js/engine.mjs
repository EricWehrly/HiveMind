import Camera from './camera.mjs';
import Seed from './core/seed.mjs';
import Client from './network/client.mjs';

const Game = {
    Camera: new Camera(),
    Seed: new Seed(123456)
};

export default Game;

const playfield = document.createElement("div")
playfield.id = "playfield";
document.body.appendChild(playfield);
