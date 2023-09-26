import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';
import KeyboardController from '../controls/keyboard-controller.mjs';
import Events from '../../engine/js/events.mjs';
import BuildingsHiveMind from '../ai/hivemind-buildings.mjs';
import Building from './building.mjs';

const Build = function(context) {

    const selectedBuilding = context?.menu?.selected?.context;

    if(selectedBuilding.name != "Node") {

        BuildingsHiveMind.QueueDesire(selectedBuilding);
        return;
    }

    const player = Character.LOCAL_PLAYER;

    const characterOpts = Object.assign({}, CharacterType[selectedBuilding.characterType]);
    characterOpts.color = player.color;
    characterOpts.position = player.position;
    characterOpts.faction = player.faction;

    return Building.Build(characterOpts);
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

new CharacterType({
    name: 'Node',
    health: 40,
    ai: null
});
UI_MENU_BUILDINGS.addItem(CharacterType.Node);

new CharacterType({
    name: 'Hunter',
    health: 30,
    _currentPurposeKey: 'spawn',
    _spawnPurposeKey: 'hunt',
    ai: null
});
const hunterMenuItem = UI_MENU_BUILDINGS.addItem(CharacterType.Hunter);
hunterMenuItem.Element.innerHTML = `Desire ${CharacterType.Hunter.name}`;

// TODO: Make these actually contribute to a research speed multiplier
// ideally render that somewhere
new CharacterType({
    name: 'Researcher',
    health: 50,
    ai: null
});
const researcherMenuItem = UI_MENU_BUILDINGS.addItem(CharacterType.Researcher);
researcherMenuItem.Element.innerHTML = `Desire ${CharacterType.Researcher.name}`;

new CharacterType({
    name: 'Healer',
    health: 30,
    _currentPurposeKey: 'heal',
    ai: null
});
const healerMenuItem = UI_MENU_BUILDINGS.addItem(CharacterType.Healer);
healerMenuItem.Element.innerHTML = `Desire ${CharacterType.Healer.name}`;

// TODO: Later, generically unlock items in menus by having them locked/unlocked
// TODO: get "Food" from its proper definition, or a constant somewhere ... 
Events.Subscribe(`${Events.List.ResearchFinished}-Food`, function() {

    const seeder = UI_MENU_BUILDINGS.addItem(CharacterType.Seeder);
    seeder.Element.innerHTML = `Desire ${CharacterType.Seeder.name}`;
    const eater = UI_MENU_BUILDINGS.addItem(CharacterType.Eater);
    eater.Element.innerHTML = `Desire ${CharacterType.Eater.name}`;
});

// rock driller

// building for sending research home

// building for receiving research from home

KeyboardController.AddDefaultBinding("openMenu/build", "b");
