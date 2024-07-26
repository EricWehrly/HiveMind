import UIElement from "./ui-element.ts";
import Events from '../events.ts';
import { TechnologyTypes } from "../TechnologyTypes.ts";

const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: UIElement.SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details) {

    if(details.type == TechnologyTypes.ATTACK && details.character.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
    }
});
