import UIElement, { SCREEN_ZONE } from "./ui-element";
import Events from '../events';
import { TechnologyTypes } from "../TechnologyTypes";
import { CooldownCompleteEvent, EquipmentChangedEvent, EquippedTechnology } from "../entities/equipment";
import Entity from "../entities/character/Entity";
import { CharacterAttackedEvent } from "../entities/character/mixins/Combative";
import SentientEntity from "../entities/character/SentientEntity";
import { Equipped } from "../entities/character/mixins/Equipped";
import Playable from "../entities/character/mixins/Playable";

let playerAttack: EquippedTechnology;

export const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details: EquipmentChangedEvent) {

    // kind of a temp fix
    const playerCharacter = details.character as Equipped & SentientEntity;
    if(details.type == TechnologyTypes.ATTACK && playerCharacter.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
        playerAttack = details.equipped;
    }
});

function onCooldownComplete(details: CooldownCompleteEvent) {

    const character = details.character;
    const localPlayer = Playable.LocalPlayer;
    if(character && (character as unknown as Entity).id == localPlayer.id) {
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
