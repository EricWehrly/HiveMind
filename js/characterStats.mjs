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

const incrementAttribute = function(attribute) {

    // TODO: It will "look" better if the cost visual is updated when ctrl is depressed
    const localPlayer = Character.LOCAL_PLAYER;
    const ctrl = localPlayer.controller.isKeyDown("Control");
    if(ctrl) {
        attribute.buy(10);
    } else {        
        attribute.buy(1);
    }
}

const makeStronger = function() {

    incrementAttribute(strength);
}

const makeFaster = function() {

    incrementAttribute(speed);
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
