import { RegisterLoopMethod } from "../../engine/js/loop.mjs";

// TODO: Check whether debug is on
function updateCharacterInfo() {

    for(var character of CHARACTER_LIST) {
        const characterInfo = getCharacterInfo(character);
        if(character.graphic) character.graphic.innerHTML = characterInfo;
    }
}

function getCharacterInfo(character) {

    const x = character.position.x.toFixed(2);
    const y = character.position.y.toFixed(2);
    return `${x}, ${y}`;
}

RegisterLoopMethod(updateCharacterInfo, false);
