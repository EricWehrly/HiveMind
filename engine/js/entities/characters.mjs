import { RegisterLoopMethod } from './../loop.mjs';

const CHARACTER_LIST = [];
if(window) window.CHARACTER_LIST = CHARACTER_LIST;

export function AddCharacterToList(character) {

    CHARACTER_LIST.push(character);
}

export function GetClosestEntity(targetCharacter, limit = 100) {

    let closest = {
        entity: null,
        distance: limit
    };
    for(var character of CHARACTER_LIST) {
        if(character != targetCharacter) {
            const distance = character.getDistance(targetCharacter);
            if(distance < closest.distance) {
                closest.distance = distance;
                closest.entity = character;
            }
        }
    }

    return closest.entity;
}

function characterLoop(elapsed) {

    for(var character of CHARACTER_LIST) {
        character.think();

        character.move(elapsed / 1000);

        character.redraw();
    }
}

RegisterLoopMethod(characterLoop, true);
