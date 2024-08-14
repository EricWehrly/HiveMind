import MenuItem, { MenuItemType } from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

const debugMenu = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_LEFT,
    name: "Debug",
    // menuAction: openMenu,
});

new MenuItem({
    menu: debugMenu,
    name: 'Draw metadata on level',
    menuItemType: MenuItemType.Checkbox
    // TODO: action is toggle checkbox
});

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");
