import { SCREEN_ZONE } from "../engine/js/ui/ui-element";
import Menu from "../engine/js/ui/menu";
import KeyboardController from "./controls/keyboard-controller.mjs";
import Character from "../engine/js/entities/character";
import Events from "../engine/js/events";
import MenuItem from "../engine/js/ui/MenuItem";
import CharacterAttribute from "../engine/js/entities/character-attribute";

let strength: CharacterAttribute = null,
speed: CharacterAttribute = null;

function characterMenuAction() {

    const selected = characterMenu.selected;
    if(selected.context.callback) selected.context.callback();
}

// we actually probably want this to be more of a modal
const characterMenu = new Menu({
    screenZone: SCREEN_ZONE.TOP_CENTER,
    name: "Character Upgrades",
    visible: false,
    menuAction: characterMenuAction
});

const strengthLabel = new MenuItem({
    menu: characterMenu,
    name: 'Strength'
});

const speedLabel = new MenuItem({
    menu: characterMenu,
    name: 'Speed'
});

const incrementAttribute = function(attribute: CharacterAttribute) {

    // TODO: It will "look" better if the cost visual is updated when ctrl is depressed
    const localPlayer = Character.LOCAL_PLAYER;
    // const ctrl = localPlayer.controller.isKeyDown("Control");
    const ctrl = false;
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

const strengthMenuItem = new MenuItem({
    menu: characterMenu,
    name: 'Hit Harder',
    context: {
        cost: 40,
        callback: makeStronger
    }
});

const speedMenuItem = new MenuItem({
    menu: characterMenu,
    name: 'Run Faster',
    context: {
        cost: 40,
        callback: makeFaster
    }
});

function updateMenuItemText(event: { attribute: CharacterAttribute }) {

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