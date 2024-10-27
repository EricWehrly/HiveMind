import Configuration from "../../engine/js/core/Configuration";
import MenuItem from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE, UI_ELEMENT_TYPE } from "../../engine/js/ui/ui-element";
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

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");

import './DebugMenuTiming';
