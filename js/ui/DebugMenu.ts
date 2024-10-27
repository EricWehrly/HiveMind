import { RegisterLoopMethod } from "../../engine/js/Loop";
import Configuration from "../../engine/js/core/Configuration";
import Events from "../../engine/js/events";
import MenuItem, { IMenuItem } from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE, UI_ELEMENT_TYPE, UIElementOptions } from "../../engine/js/ui/ui-element";
import Timing, { TimingEvent } from "../../engine/js/util/Timings";
import KeyboardController from "../controls/KeyboardController";

interface MenuContext {
    menu: Menu
}

function toggleLevelMetaDrawing() {
    Configuration.Set("debug.drawLevelMeta", !Configuration.Get("debug.drawLevelMeta"));
}

function debugMenuAction(context: MenuContext) {
    const item = context.menu.selected;
    if(item.context.callback) item.context.callback.bind(item)();
}

// TODO: initial value from config
const debugMenu = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_LEFT,
    name: "Debug",
    menuAction: debugMenuAction
});

new MenuItem({
    menu: debugMenu,
    name: 'Draw metadata on level',
    elementType: UI_ELEMENT_TYPE.Checkbox,
    customAction: toggleLevelMetaDrawing
});

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

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");
