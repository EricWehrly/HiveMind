import UIElement from "./ui-element.mjs";
import Resource from "../entities/resource.mjs";
import Events from "../events.ts";

// TODO: get this from some configuration ...
// (and maybe allow us to configure per resource ... or override a default per resource ...)
const RENDER_RESERVED = true;

function createResourceUI(resource) {

    resource.UIElement = new UIElement({
        screenZone: UIElement.SCREEN_ZONE.TOP_RIGHT,
        classes: [ 'Resource' ]
    });

    resourceChanged({
        resource,
        to: resource.value
    });
}

function resourceChanged(details) {

    if(RENDER_RESERVED) {
        details.resource.UIElement.setText(`${details.resource.name}: ${Math.round(details.to)} (${Math.round(details.resource.reserved)})`);
    } else {
        details.resource.UIElement.setText(`${details.resource.name}: ${Math.round(details.to)}`);
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
