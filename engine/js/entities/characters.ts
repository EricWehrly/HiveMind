import { RegisterLoopMethod } from '../loop.mjs';
import Entity from './character/Entity';

function characterLoop(elapsed: number) {

    for(var character of Entity.List) {
        // TODO: we could precompute this
        if(character?.position?.chunk?.active == false
            // @ts-expect-error
            || character?.dead == true) {
            continue;
        }

        character.move(elapsed / 1000);
    }
}

RegisterLoopMethod(characterLoop, true);
