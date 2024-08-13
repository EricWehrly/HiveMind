import Events from "../../engine/js/events";
import Menu, { MenuItem } from "../../engine/js/ui/menu";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

function reBindKey(action: string, key: string) {
    console.log(action);
    console.log(key);
    // KeyboardController.AddDefaultBinding(action, key);
}

const characterMenu = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_CENTER,
    name: "Key Bindings",
    menuAction: reBindKey
});

Events.Subscribe(Events.List.GameStart, function() {
    for(const [action, key] of Object.entries(KeyboardController.Default_Bindings)) {
        const menuItem: MenuItem = {
            name: `${action} - ${key}`,
            context: {
                // callback: reBindKey
                action,
                key
            }
        }
        characterMenu.addItem(menuItem);
    }
});
