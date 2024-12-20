import { SCREEN_ZONE } from "../engine/js/ui/ui-element";
import Menu from "../engine/js/ui/menu";
import KeyboardController from "./controls/KeyboardController";
import Events from "../engine/js/events";
import MenuItem from "../engine/js/ui/MenuItem";
import EntityAttribute, { EntityAttributeChangedEvent } from "../engine/js/entities/EntityAttribute";
import { CharacterUtils } from "../engine/js/entities/character/CharacterUtils";

let strength: EntityAttribute = null,
speed: EntityAttribute = null;

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

const incrementAttribute = function(attribute: EntityAttribute) {

    // TODO: It will "look" better if the cost visual is updated when ctrl is depressed
    const localPlayer = CharacterUtils.GetLocalPlayer();
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

function updateMenuItemText(event: EntityAttributeChangedEvent) {

    const { attribute } = event;
    if(attribute == strength) {
        strengthMenuItem.text = (strengthMenuItem.name 
            + `<br />Cost: ${attribute.cost}`);
        strengthLabel.text = `Strength: ${strength.value}`;
    } else if(attribute == speed) {
        speedMenuItem.text = (speedMenuItem.name 
            + `<br />Cost: ${attribute.cost}`);
        speedLabel.text =  `Speed: ${speed.value}`;
    }
}

KeyboardController.AddDefaultBinding("openMenu/character upgrades", "c");

Events.Subscribe(Events.List.GameStart, function() {
    
    const localPlayer = CharacterUtils.GetLocalPlayer();
    
    strength = localPlayer.getAttribute("Strength");
    const eventDetails: EntityAttributeChangedEvent = {
        entity: localPlayer,
        attribute: strength
    }
    updateMenuItemText(eventDetails);
    strengthLabel.text = `Strength: ${strength.value}`;
    speed = localPlayer.getAttribute("Speed");
    eventDetails.attribute = speed;
    updateMenuItemText(eventDetails);
    speedLabel.text = `Speed: ${speed.value}`;

    Events.Subscribe(Events.List.EntityAttributeChanged, updateMenuItemText);
});
