import Events from "../../engine/js/events";
import Menu, { MenuItem } from "../../engine/js/ui/menu";
import UIElement from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

function reBindKey(action: string, key: string) {
    console.log(action);
    console.log(key);
    // KeyboardController.AddDefaultBinding(action, key);
}

const characterMenu = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Key Bindings",
    visible: false,
    menuAction: reBindKey
});

KeyboardController.AddDefaultBinding("openMenu/key bindings", "Escape");

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
