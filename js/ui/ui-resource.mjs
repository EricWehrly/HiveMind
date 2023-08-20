import UIElement from "./ui-element.mjs";
import Resource from "../entities/resource.mjs";
import Events from "../events.mjs";

function createResourceUI(resource) {

    resource.UIElement = new UIElement({
        screenZone: UIElement.SCREEN_ZONE.TOP_RIGHT
    });
    resource.UIElement.Element.innerHTML = resource.name;
}

// on resource change, innerHTML = value

Events.Subscribe(Events.List.GameStart, function() {

    for(var index of Object.keys(Resource.List)) {
        const resource = Resource.List[index];
        createResourceUI(resource);
    }

    Events.Subscribe(Events.List.ResourceCreated, createResourceUI);
});
