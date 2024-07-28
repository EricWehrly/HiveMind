// when hit escape

import Menu from "../../engine/js/ui/menu.mjs";
import UIElement from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/keyboard-controller.mjs";

// show panel

// (start by) listing everything in
// KeyboardController.Default_Bindings
const characterMenu = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Key Bindings",
    visible: false,
});


KeyboardController.AddDefaultBinding("openMenu/key bindings", "Escape");
