import Events from "../../engine/js/events";
import MenuItem from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

interface PauseMenuItemContext {
    menu: Menu
}

function openMenu(context: PauseMenuItemContext) {
    const callingMenu = context.menu;
    const selectedMenuItem = callingMenu.selected;
    const menu = selectedMenuItem.context.menu;
    callingMenu.close();
    menu.open();
}

const pauseMenu = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_CENTER,
    name: "Pause",
    menuAction: openMenu,
    icon: '<u>=</u>',
    iconPosition: SCREEN_ZONE.TOP_LEFT
});

KeyboardController.AddDefaultBinding("openMenu/Pause", "Escape");

Events.Subscribe(Events.List.DataLoaded, function() {
    const pauseMenuItems = [
        'Key Bindings',
        'Debug'
    ];
    pauseMenuItems.forEach((menuItemName) => {
        const menu = Menu.Get(menuItemName);
        const menuItemContext: PauseMenuItemContext = {
            menu
        }
        new MenuItem({
            menu: pauseMenu,
            name: `${menu.name}`,
            context: menuItemContext
        });
    });
});
