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

// TODO: if timing enabled
const segmentKeys = Timing.Segments;
for(const segmentName in segmentKeys) {
    debugTimingSegment(segmentName);
}

function toggleSegment(): void {

    const menuItem: MenuItem = this;
    const segments = Timing.Segments[menuItem.name];

    const elementOptions: UIElementOptions & IMenuItem = {
        menu: debugMenu,
    };
    const parts: Array<keyof typeof segments> = ["min", "max", "median"];
    for(const part of parts) {
        elementOptions.name = part;
        const child = menuItem.resolveChild(elementOptions);
        // @ts-expect-error
        const segmentPart: number = segments[part];
        const amount = Math.round(segmentPart);
        child.setText(`${part}: ${amount}ms`);
        child.visible = true;
    }
}

function debugTimingSegment(segmentName: string): void {
    
    new MenuItem({
        menu: debugMenu,
        name: segmentName,
        section: "Timing",
        context: {
            callback: toggleSegment
        }
    });
}

function OnNewSegment(event: TimingEvent): void {
    debugTimingSegment(event.segmentName);
}

Events.Subscribe(Events.List.NewSegment, OnNewSegment);

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");
