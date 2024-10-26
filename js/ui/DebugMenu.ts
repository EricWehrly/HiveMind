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

function toggleSegment(): void {

    // all of the segments with this type are the children

    const menuItem: MenuItem = this;
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
}

function _toggleTimingFunctionValues(parent: MenuItem): void {

    const segments = Timing.Segments[parent.name];

    const elementOptions: UIElementOptions & IMenuItem = {
        menu: debugMenu,
    };
    const parts: Array<keyof typeof segments> = ["min", "max", "median"];
    for(const part of parts) {
        elementOptions.name = part;
        const child = parent.resolveChild(elementOptions);
        // @ts-expect-error
        const segmentPart: number = segments[part];
        const amount = Math.round(segmentPart) || 'N/A';
        child.setText(`${part}: ${amount}ms`);
        child.visible = true;
    }
}

function debugTimingSegment(segmentType: string): void {
    
    new MenuItem({
        menu: debugMenu,
        name: segmentType,
        section: "Timing",
        context: {
            callback: toggleSegment
        }
    });
}

function OnNewSegmentType(event: TimingEvent): void {
    debugTimingSegment(event.segmentType);
}

Events.Subscribe(Events.List.NewSegmentType, OnNewSegmentType);

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");
