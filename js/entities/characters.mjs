import { RegisterLoopMethod } from './../loop.mjs';

const CHARACTER_LIST = [];
if(window) window.CHARACTER_LIST = CHARACTER_LIST;

export function AddCharacterToList(character) {

    CHARACTER_LIST.push(character);
}

export function RemoveCharacterFromList(character) {

    CHARACTER_LIST.splice(CHARACTER_LIST.indexOf(character), 1);
}

export function GetClosestEntity(targetCharacter, options = {
        limit: 100,
        filterChildren: true
    }) {

    let closest = {
        entity: null,
        distance: options.limit
    };
    for(var character of CHARACTER_LIST) {
        if(character != targetCharacter) {
            if(options.filterChildren && character.parent == targetCharacter) {
                continue;
            }
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
        character.think(elapsed);

        character.move(elapsed / 1000);
    }
}

RegisterLoopMethod(characterLoop, true);
