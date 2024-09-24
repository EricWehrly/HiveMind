import UIElement, { SCREEN_ZONE } from "./ui-element";
import Events from '../events';
import { TechnologyTypes } from "../TechnologyTypes";
import { CooldownCompleteEvent, EquipmentChangedEvent, EquippedTechnology } from "../entities/equipment";
import { CharacterAttackedEvent } from "../entities/character/mixins/Combative";
import { Equipped } from "../entities/character/mixins/Equipped";
import { Playable } from "../entities/character/mixins/Playable";
import { CharacterUtils } from "../entities/character/CharacterUtils";

let playerAttack: EquippedTechnology;

export const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details: EquipmentChangedEvent) {

    // kind of a temp fix
    const playerCharacter = details.character as Equipped & Playable;
    if(details.type == TechnologyTypes.ATTACK && playerCharacter.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
        playerAttack = details.equipped;
    }
});

function onCooldownComplete(details: CooldownCompleteEvent) {

    const isLocalPlayer = CharacterUtils.IsLocalPlayer(details.character);
    
    if(isLocalPlayer) {
        UI_ELEMENT_ATTACK.removeClass('cooldown');
    }
}

function onCharacterAttacked(details: CharacterAttackedEvent) {

    if(details.equipped == playerAttack) {
        UI_ELEMENT_ATTACK.addClass('cooldown');
    }
}

Events.Subscribe(Events.List.CooldownComplete, onCooldownComplete);
Events.Subscribe(Events.List.CharacterAttacked, onCharacterAttacked);
