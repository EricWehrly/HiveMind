import UIElement, { SCREEN_ZONE } from "./ui-element";
import Events from '../events';
import { TechnologyTypes } from "../TechnologyTypes";
import Rectangle from "../baseTypes/rectangle";
import { CooldownCompleteEvent, EquipmentChangedEvent, EquippedTechnology } from "../entities/equipment";
import Character from "../entities/character";
import Entity from "../entities/character/Entity";
import HiveMindCharacter from "../../../js/entities/character/HiveMindCharacter";
import { CharacterAttackedEvent } from "../entities/character/mixins/Combative";

let playerAttack: EquippedTechnology;

const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details: EquipmentChangedEvent) {

    // kind of a temp fix
    const hiveMindCharacter = details.character as unknown as HiveMindCharacter;
    if(details.type == TechnologyTypes.ATTACK && hiveMindCharacter.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
        playerAttack = details.equipped;
    }
});

const baseRedraw = UI_ELEMENT_ATTACK.redraw;
UI_ELEMENT_ATTACK.redraw = function(screenRect: Rectangle) {
    baseRedraw.call(UI_ELEMENT_ATTACK, screenRect);
    if(playerAttack && !playerAttack.ready) {
        let progress = (performance.now() - playerAttack.lastFired) / playerAttack.technology.delay;
        progress = Math.floor(Math.min(1, progress) * 100);
        const background = `linear-gradient(to right, rgba(0, 0, 0, 0.9) ${progress}%, rgba(0, 0, 0, 0) 100%)`;
        UI_ELEMENT_ATTACK.Element.style.background = background;
    }
};

function onCooldownComplete(details: CooldownCompleteEvent) {

    const character = details.character;
    if(character && (character as unknown as Entity).id == Character.LOCAL_PLAYER.id) {
        UI_ELEMENT_ATTACK.Element.style.background = "";
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
