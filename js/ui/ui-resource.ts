import UIElement, { SCREEN_ZONE } from "./ui-element";
import Resource, { ResourceChangedEvent, ResourceEvent } from "../entities/resource";
import Events from "../events";

// TODO: get this from some configuration ...
// (and maybe allow us to configure per resource ... or override a default per resource ...)
const RENDER_RESERVED = true;

function createResourceUI(event: ResourceEvent) {

    const resource = event.resource;

    resource.UIElement = new UIElement({
        screenZone: SCREEN_ZONE.TOP_RIGHT,
        classes: [ 'Resource' ]
    });

    const details: ResourceChangedEvent = {
        resource,
        from: null,
        to: resource.value
    }
    resourceChanged(details);
}

function resourceChanged(details: ResourceChangedEvent) {

    if(RENDER_RESERVED) {
        const text = `${details.resource.name}: ${Math.round(details.to)} (${Math.round(details.resource.reserved)})`;
        details.resource.UIElement.setText(text);
    } else {
        const text = `${details.resource.name}: ${Math.round(details.to)}`;
        details.resource.UIElement.setText(text);
    }
}

Events.Subscribe(Events.List.GameStart, function() {

    //@ts-expect-error
    const resourceList = Resource.List;
    for(var index of Object.keys(resourceList)) {
        const resource = resourceList[index];
        const event: ResourceEvent = { resource };
        createResourceUI(event);
    }

    Events.Subscribe(Events.List.ResourceCreated, createResourceUI);    
    Events.Subscribe(Events.List.ResourceValueChanged, resourceChanged);
});
