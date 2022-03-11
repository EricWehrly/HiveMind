import { RegisterLoopMethod } from './../loop.mjs';

const CHARACTER_LIST = [];

export function AddCharacterToList(character) {

    CHARACTER_LIST.push(character);
}

function characterLoop(elapsed) {

    for(var character of CHARACTER_LIST) {
        character.move(elapsed / 1000);

        character.redraw();
    }
}

RegisterLoopMethod(characterLoop, true);
