import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';
import HiveMindCharacter from './character-extensions.mjs';
import KeyboardController from '../controls/keyboard-controller.mjs';

const Build = function(context) {

    const selectedBuilding = context?.menu?.selected?.context;

    const player = Character.LOCAL_PLAYER;

    const characterOpts = Object.assign({}, CharacterType[selectedBuilding.characterType]);
    characterOpts.color = player.color;
    characterOpts.position = player.position;
    characterOpts.faction = player.faction;
    characterOpts.isBuilding = true;

    const amount = characterOpts.health;
    if(!player.canAfford(amount)) {
        console.log(`You can't afford to build ${characterOpts.name} for ${amount}`);
        console.log(`You got ${player.health}, son.`);
        return;
    }
    player.health -= amount;

    new HiveMindCharacter(characterOpts);
}

const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    visible: false,
    menuAction: Build
});

// TODO: import from json, or ... ?
new CharacterType({
    name: 'Seeder',
    health: 15,
    _currentPurposeKey: 'grow',
    ai: null
});

// this probably needs to express a (max) distance
new CharacterType({
    name: 'Eater',
    health: 40,
    _currentPurposeKey: 'spawn',
    _spawnPurposeKey: 'consume',
    ai: null
});

// rock driller

// building for doing 'research' ?

// building for sending research home

// building for receiving research from home

UI_MENU_BUILDINGS.addItem(CharacterType.Seeder);
UI_MENU_BUILDINGS.addItem(CharacterType.Eater);

KeyboardController.AddDefaultBinding("openMenu/build", "b");
