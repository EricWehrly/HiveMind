
import Timing, { TimingEvent } from "../../engine/js/util/Timings";
import Events from "../../engine/js/events";
import { RegisterLoopMethod } from "../../engine/js/Loop";
import MenuItem, { IMenuItem } from "../../engine/js/ui/MenuItem";
import { UIElementOptions } from "../../engine/js/ui/ui-element";
import { UI_ELEMENT_TYPE } from "../../engine/js/ui/ui-element";
import Menu from "../../engine/js/ui/menu";

let debugMenu = Menu.Get("Debug");

const menuItemsToUpdate: MenuItem[] = [];

function loopUpdateDebugTimings() {

    menuItemsToUpdate.forEach((menuItem) => {    

        const segments = Timing.SegmentsByType(menuItem.name);
    
        for(var segment of segments) {
            const elementOptions: UIElementOptions & IMenuItem = {
                name: segment.name,
                menu: debugMenu,
            };
            const child = menuItem.resolveChild(elementOptions);
            child.visible = true;
            _toggleTimingFunctionValues(child);
        }
    });
}

RegisterLoopMethod(loopUpdateDebugTimings);

function toggleSegment(): void {

    if(menuItemsToUpdate.includes(this)) {
        menuItemsToUpdate.splice(menuItemsToUpdate.indexOf(this), 1);
    } else {
        menuItemsToUpdate.push(this);
    }
}

function _toggleTimingFunctionValues(parent: MenuItem): void {

    const segments = Timing.Segments[parent.name];

    const elementOptions: UIElementOptions & IMenuItem = {
        name: `${parent.name}-values`,
        menu: debugMenu,
    };
    const child = parent.resolveChild(elementOptions);
    const min = Math.round(segments.min) || 'n/a';
    const max = Math.round(segments.max) || 'n/a';
    const median = Math.round(segments.median) || 'n/a';
    if(min != 'n/a' || max != 'n/a' || median != 'n/a') {
        child.text = `min: ${min}ms &nbsp; &nbsp; max: ${max}ms &nbsp; &nbsp; med: ${median}ms`;
        child.visible = true;
    }
}

function debugTimingSegment(segmentType: string): void {

    debugMenu = Menu.Get("Debug");
    
    const menuItem = new MenuItem({
        menu: debugMenu,
        name: segmentType,
        section: "Timing",
        context: {
            callback: toggleSegment
        }
    });
    menuItem.text = null;

    const labelOptions: UIElementOptions & IMenuItem = {
        elementType: UI_ELEMENT_TYPE.Label,
        menu: debugMenu,
    }
    // TODO: because this is a label, it shouldn't be navigable as a menu item
    const label = menuItem.resolveChild(labelOptions);
    label.text = segmentType;
}

function OnNewSegmentType(event: TimingEvent): void {
    debugTimingSegment(event.segmentType);
}

Events.Subscribe(Events.List.NewSegmentType, OnNewSegmentType);
