import { RegisterLoopMethod } from '../loop.mjs';
import Entity from './character/Entity';

export const CHARACTER_LIST: Entity[] = [];
//@ts-expect-error (window)
if(window) window.CHARACTER_LIST = CHARACTER_LIST;

export function AddCharacterToList(character: Entity) {

    CHARACTER_LIST.push(character);
}

export function RemoveCharacterFromList(character: Entity) {

    CHARACTER_LIST.splice(CHARACTER_LIST.indexOf(character), 1);
}

function characterLoop(elapsed: number) {

    for(var character of CHARACTER_LIST) {
        // TODO: we could precompute this
        if(character?.position?.chunk?.active == false
            // @ts-expect-error
            || character?.dead == true) {
            continue;
        }
        // @ts-expect-error
        character.think(elapsed);

        character.move(elapsed / 1000);
    }
}

RegisterLoopMethod(characterLoop, true);
