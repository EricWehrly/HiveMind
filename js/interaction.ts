import Menu from '../engine/js/ui/menu.mjs';
import { RegisterLoopMethod } from '../engine/js/loop.mjs';
import HiveMindCharacter from './entities/character/HiveMindCharacter';
import Action from '../engine/js/action';
import { Living } from '../engine/js/entities/character/mixins/Living';

function checkPlayerInteraction() {

    const localPlayer = window.LOCAL_PLAYER;
    const closest = localPlayer.target as HiveMindCharacter & Living;

    if(Menu.anyOpen || (closest != null && !closest.isAlive)) {

        localPlayer.toolTip.entity = null;
        localPlayer.toolTip.visible = false;
        // localPlayer.toolTip.message = '';
        return;
    }

    if(closest == null) return;
    localPlayer.toolTip.entity = closest;

    if(closest.canBeStudied == undefined) debugger;

    // maybe actions could have a "check condition" ?
    if(closest.canBeStudied(localPlayer)) {
        // this only works with 1 local player cause actions will be local to this system ...
        Action.List["study"].target = closest;
        Action.List["study"].enabled = true;
    } else {
        Action.List["study"].enabled = false;
    }

    if(closest.canBeEaten(localPlayer)) {
        Action.List["consume"].target = closest;
        Action.List["consume"].enabled = true;
    } else {        
        Action.List["consume"].enabled = false;
    }

    localPlayer.toolTip.message = closest.toolTipMessage || '';
}

// we can limit this to when local player moves
// this implementation is lazy but should technically work fine
RegisterLoopMethod(checkPlayerInteraction, false);
