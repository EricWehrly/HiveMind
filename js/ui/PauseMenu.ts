import Events from "../../engine/js/events";
import Menu, { MenuItem } from "../../engine/js/ui/menu";
import UIElement from "../../engine/js/ui/ui-element";
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
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_CENTER,
    name: "Pause",
    menuAction: openMenu
});

KeyboardController.AddDefaultBinding("openMenu/Pause", "Escape");

Events.Subscribe(Events.List.DataLoaded, function() {
    const pauseMenuItems = [
        'Key Bindings'
    ];
    pauseMenuItems.forEach((menuItemName) => {
        const menu = Menu.Get(menuItemName);
        const menuItemContext: PauseMenuItemContext = {
            menu
        }
        const menuItem: MenuItem = {
            name: `${menu.name}`,
            context: menuItemContext
        }
        pauseMenu.addItem(menuItem);
    });
});
