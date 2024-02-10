import UIElement from "./ui-element.mjs";
import Resource from "../entities/resource.mjs";
import Events from "../events.mjs";

// TODO: get this from some configuration ...
// (and maybe allow us to configure per resource ... or override a default per resource ...)
const RENDER_RESERVED = true;

function createResourceUI(resource) {

    resource.UIElement = new UIElement({
        screenZone: UIElement.SCREEN_ZONE.TOP_RIGHT
    });
    // TODO: Eventually want UIElement constructor to "magically" figure this out ...
    resource.UIElement.addClass("Resource");
    resourceChanged({
        resource,
        to: resource.value
    });
    // resource.UIElement.Element.innerHTML = resource.name;
}

// on resource change, innerHTML = value

function resourceChanged(details) {

    if(RENDER_RESERVED) {
        details.resource.UIElement.Element.innerHTML = `${details.resource.name}: ${Math.round(details.to)} (${Math.round(details.resource.reserved)})`;
    } else {
        details.resource.UIElement.Element.innerHTML = `${details.resource.name}: ${Math.round(details.to)}`;
    }
}

Events.Subscribe(Events.List.GameStart, function() {

    for(var index of Object.keys(Resource.List)) {
        const resource = Resource.List[index];
        createResourceUI(resource);
    }

    Events.Subscribe(Events.List.ResourceCreated, createResourceUI);    
    Events.Subscribe(Events.List.ResourceValueChanged, resourceChanged);
});
