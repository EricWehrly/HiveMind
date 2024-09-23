import { RegisterLoopMethod } from '../loop.mjs';
import Entity from './character/Entity';
import { IsSentient } from './character/mixins/Sentient';

function characterLoop(elapsed: number) {

    for(var character of Entity.List) {
        // TODO: we could precompute this
        if(character?.position?.chunk?.active == false
            // @ts-expect-error
            || character?.dead == true) {
            continue;
        }
        if(IsSentient(character)) {
            character.ai.think(elapsed);
        }

        character.move(elapsed / 1000);
    }
}

RegisterLoopMethod(characterLoop, true);
