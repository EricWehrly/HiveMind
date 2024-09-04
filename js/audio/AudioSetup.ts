// TODO: Load from data file or something, instead of this (later)

import { Defer } from "../loop.mjs";
import GameSound from "./GameSound";

function loadSounds() {
    new GameSound('wrong', 'wrong.wav');
}

Defer(loadSounds);
