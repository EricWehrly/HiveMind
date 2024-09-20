import Menu from '../engine/js/ui/menu';
import HiveMindCharacter from './entities/character/HiveMindCharacter';
import Action from '../engine/js/action';
import { Living } from '../engine/js/entities/character/mixins/Living';
import Events from '../engine/js/events';
import { CharacterUtils } from '../engine/js/entities/character/CharacterUtils';
import { Sentient } from '../engine/js/entities/character/mixins/Sentient';
import { CharacterTargetChangedEvent } from '../engine/js/ai/basic';
import Entity from '../engine/js/entities/character/Entity';

function updatePlayerTooltip(character: Entity) {

    const localPlayer = CharacterUtils.GetLocalPlayer() as HiveMindCharacter & Sentient;
    const closest = localPlayer.ai.targetEntity as HiveMindCharacter & Living;

    if(Menu.anyOpen || closest == null || !closest.isAlive) {

        localPlayer.toolTip.entity = null;
        localPlayer.toolTip.visible = false;
        // localPlayer.toolTip.message = '';
        return;
    }

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

function onCharacterTargetChanged(event: CharacterTargetChangedEvent) {
    if(CharacterUtils.IsLocalPlayer(event.character)) {
        updatePlayerTooltip(event.character);
    }
}

Events.Subscribe(Events.List.CharacterTargetChanged, onCharacterTargetChanged);
