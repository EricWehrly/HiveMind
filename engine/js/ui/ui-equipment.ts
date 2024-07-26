import UIElement from "./ui-element";
import Events from '../events';
import { TechnologyTypes } from "../TechnologyTypes";

const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: UIElement.SCREEN_ZONE.BOTTOM_CENTER
});

Events.Subscribe(Events.List.EquipmentChanged, function(details: any) {

    if(details.type == TechnologyTypes.ATTACK && details.character.isPlayer == true) {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.setText(`[ space ] - ${details.to.name}`);
    }
});
