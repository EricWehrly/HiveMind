import Configuration from "../../engine/js/core/Configuration";
import MenuItem, { MenuItemType } from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

interface MenuContext {
    menu: Menu
}

function toggleLevelMetaDrawing() {
    Configuration.Set("debug.drawLevelMeta", !Configuration.Get("debug.drawLevelMeta"));
}

function debugMenuAction(context: MenuContext) {
    const item = context.menu.selected;
    if(item.context.action) item.context.action();
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
    menuItemType: MenuItemType.Checkbox,
    context: {
        action: toggleLevelMetaDrawing
    }
    // TODO: action is toggle checkbox
});

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");
