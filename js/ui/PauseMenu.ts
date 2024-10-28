import Action, { ActionOptions } from "../../engine/js/action";
import Events from "../../engine/js/events";
import MenuItem from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/KeyboardController";

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
    icon: {
        text: 'pause',
        screenZone: SCREEN_ZONE.TOP_LEFT
    }
});

/** Escape Button begin */
function handleEscape() {
    if(Menu.anyOpen) {
        Menu.Current.close();
        return;
    }
    if(pauseMenu.visible) {
        pauseMenu.close();
    } else {
        pauseMenu.open();
    }
}

const escapeActionOptions: ActionOptions = {
    name: "handleEscape",
    oncePerPress: true,
    callback: handleEscape
}
new Action(escapeActionOptions)
    .enabled = true;

KeyboardController.AddDefaultBinding(escapeActionOptions.name, "Escape");
/** Escape Button end */

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
