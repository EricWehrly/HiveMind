import Menu from '../engine/js/ui/menu.mjs';
import UIElement from '../engine/js/ui/ui-element.mjs';
import KeyboardController from './controls/keyboard-controller.mjs';

const Research = function(context) {
    console.log(context);
}

const UI_MENU_RESEARCH = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Research",
    visible: false,
    menuAction: Research
});

KeyboardController.AddDefaultBinding("openMenu/research", "r");
