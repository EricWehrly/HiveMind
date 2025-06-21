// TODO: Load from data file or something, instead of this (later)

import { Defer } from "../../engine/js/Loop";
import GameSound from "../../engine/js/audio/GameSound";

function loadSounds() {
    new GameSound('wrong', 'wrong.wav');
}

Defer(loadSounds);
