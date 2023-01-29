import UIElement from "./ui-element.mjs";
import Events from '../events.mjs';

const UI_ELEMENT_ATTACK = new UIElement({
    screenPosition: UIElement.SCREEN_ZONE.BOTTOM_MIDDLE
});

// create ui element ...

Events.Subscribe(Events.List.EquipmentChanged, function(details) {

    // TODO: This should be an enum ...
    if(details.type == "attack") {
        UI_ELEMENT_ATTACK.Element.innerHTML = details.to.name;
    }
});