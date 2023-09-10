import UIElement from "../engine/js/ui/ui-element.mjs";
import Menu from "../engine/js/ui/menu.mjs";
import KeyboardController from "./controls/keyboard-controller.mjs";
import Resource from "../engine/js/entities/resource.mjs";
import Character from "../engine/js/entities/character.mjs";

let strength = null,
speed = null;

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

    if(!strength) {
        const localPlayer = Character.LOCAL_PLAYER;
        strength = localPlayer.getAttribute("Strength");        
    }
    
    // TODO: Move cost into attribute
    const food = Resource.Get("food")?.value || 0;
    if(food > this.cost) {
        Resource.Get("food").value -= this.cost;
        this.cost = Math.round(this.cost + Math.log(this.cost));
        strength.value += 1;
    }
}

const makeFaster = function() {

    const localPlayer = Character.LOCAL_PLAYER;
    if(!speed) {
        speed = localPlayer.getAttribute("Speed");
    }

    let increment = 1;
    let costProjection = this.cost;

    // TODO: It will "look" better if the cost is updated when ctrl is depressed
    const ctrl = localPlayer.controller.isKeyDown("Control");
    if(ctrl) {
        for(var i = 0; i < 10; i++) {
            costProjection = Math.round(costProjection + Math.log(costProjection));
            increment += 1;
        }
    }
    
    // TODO: Move cost into attribute
    const food = Resource.Get("food")?.value || 0;
    if(food > costProjection) {
        Resource.Get("food").value -= costProjection;
        this.cost = Math.round(costProjection + Math.log(costProjection));
        speed.value += increment;
    }
}

const strongerItem = characterMenu.addItem({
    name: 'Hit Harder',
    cost: 40,
    callback: makeStronger
});

const fasterItem = characterMenu.addItem({
    name: 'Run Faster',
    cost: 40,
    callback: makeFaster
});

KeyboardController.AddDefaultBinding("openMenu/character upgrades", "c");
