import UIElement from "../engine/js/ui/ui-element.mjs";
import Menu from "../engine/js/ui/menu.mjs";
import KeyboardController from "./controls/keyboard-controller.mjs";
import Resource from "../engine/js/entities/resource.mjs";

function characterMenuAction(context) {

    const selected = characterMenu.selected;
    if(selected.context.callback) selected.context.callback();
}

// we actually probably want this to be more of a modal
const characterMenu = new Menu({
    screenZone: UIElement.SCREEN_ZONE.TOP_CENTER,
    name: "Character Upgrades",
    visible: false,
    menuAction: characterMenuAction
});

const makeStronger = function() {
    
    // if we can pay the cost
    const food = Resource.Get("food")?.value || 0;
    this.cost = Math.round(this.cost + Math.log(this.cost));
}

const strongerItem = characterMenu.addItem({
    name: 'Hit Harder',
    cost: 40,
    callback: makeStronger
});

const fasterItem = characterMenu.addItem({
    name: 'Run Faster',
    cost: 40,
    callback: makeStronger
});

KeyboardController.AddDefaultBinding("openMenu/character upgrades", "c");
