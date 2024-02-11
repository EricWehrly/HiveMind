import UIElement from "./ui-element.mjs";
import Events from '../events.mjs';
import Technology from "../technology.mjs";

const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: UIElement.SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details) {

    if(details.type == Technology.Types.ATTACK && details.character.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
    }
});
