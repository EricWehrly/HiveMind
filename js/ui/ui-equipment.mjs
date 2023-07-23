import UIElement from "./ui-element.mjs";
import Events from '../events.mjs';

const UI_ELEMENT_ATTACK = new UIElement({
    screenZone: UIElement.SCREEN_ZONE.BOTTOM_CENTER
});

// create ui element ...

Events.Subscribe(Events.List.EquipmentChanged, function(details) {

    // TODO: This should be an enum ...
    if(details.type == "attack") {
        // TODO: get the bound key rather than using "magic strings"
        UI_ELEMENT_ATTACK.Element.innerHTML = `[ space ] - ${details.to.name}`;
    }
});