import Camera from './camera.mjs';

const Game = {
    Camera: new Camera()
};

export default Game;

const playfield = document.createElement("div")
playfield.id = "playfield";
document.body.appendChild(playfield);
