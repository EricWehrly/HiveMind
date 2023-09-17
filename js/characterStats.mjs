import UIElement from "../engine/js/ui/ui-element.mjs";
import Menu from "../engine/js/ui/menu.mjs";
import KeyboardController from "./controls/keyboard-controller.mjs";
import Resource from "../engine/js/entities/resource.mjs";
import Character from "../engine/js/entities/character.mjs";
import Events from "../engine/js/events.mjs";

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

const strengthLabel = characterMenu.addLabel({
    name: 'Strength'
});

const speedLabel = characterMenu.addLabel({
    name: 'Speed'
});

const makeStronger = function() {

    const localPlayer = Character.LOCAL_PLAYER;
    if(!strength) {
        strength = localPlayer.getAttribute("Strength");
    }
    const cost = strength.cost;

    let increment = 1;
    let costProjection = cost;

    /*
    // TODO: It will "look" better if the cost is updated when ctrl is depressed
    const ctrl = localPlayer.controller.isKeyDown("Control");
    if(ctrl) {
        for(var i = 0; i < 10; i++) {
            costProjection = Math.round(costProjection + Math.log(costProjection));
            increment += 1;
        }
    }
    */
    
    // TODO: Move cost into attribute
    const food = Resource.Get("food")?.value || 0;
    if(food > costProjection) {
        Resource.Get("food").value -= costProjection;
        strength.value += increment;
    }

    // strengthLabel.Element.innerHTML = `Strength: ${strength.value}`;
}

const makeFaster = function() {

    const localPlayer = Character.LOCAL_PLAYER;
    if(!speed) {
        speed = localPlayer.getAttribute("Speed");
    }

    let increment = 1;
    let costProjection = this.cost;
    
    // TODO: Move cost into attribute
    const food = Resource.Get("food")?.value || 0;
    if(food > costProjection) {
        Resource.Get("food").value -= costProjection;
        speed.value += increment;
    }

    // speedLabel.Element.innerHTML = `Speed: ${speed.value}`;
}

const strengthMenuItem = characterMenu.addItem({
    name: 'Hit Harder',
    cost: 40,
    callback: makeStronger
});

const speedMenuItem = characterMenu.addItem({
    name: 'Run Faster',
    cost: 40,
    callback: makeFaster
});

function updateMenuItemText(event) {

    const { attribute } = event;
    if(attribute == strength) {
        strengthMenuItem.Element.innerHTML = strengthMenuItem.name 
            + `<br />Cost: ${attribute.cost}`;
        strengthLabel.Element.innerHTML = `Strength: ${strength.value}`;
    } else if(attribute == speed) {
        speedMenuItem.Element.innerHTML = speedMenuItem.name 
            + `<br />Cost: ${attribute.cost}`;
        speedLabel.Element.innerHTML = `Speed: ${speed.value}`;
    }
}

KeyboardController.AddDefaultBinding("openMenu/character upgrades", "c");

Events.Subscribe(Events.List.GameStart, function() {
    
    const localPlayer = Character.LOCAL_PLAYER;
    
    strength = localPlayer.getAttribute("Strength");
    updateMenuItemText( { attribute: strength } );
    strengthLabel.Element.innerHTML = `Strength: ${strength.value}`;
    speed = localPlayer.getAttribute("Speed");
    updateMenuItemText( { attribute: speed } );
    speedLabel.Element.innerHTML = `Speed: ${speed.value}`;

    Events.Subscribe(Events.List.CharacterAttributeChanged, updateMenuItemText);
});
