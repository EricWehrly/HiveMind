import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';
import KeyboardController from '../controls/keyboard-controller.mjs';
import Events from '../../engine/js/events.mjs';
import Building from './building.mjs';
import NodeAI from '../ai/node.mjs';

const desireLabels = {};

const Build = function (context) {

    const selectedBuilding = context?.menu?.selected?.context;

    if (selectedBuilding.name != "Node") {

        NodeAI.QueueDesire(selectedBuilding);
        return;
    }

    const player = Character.LOCAL_PLAYER;

    const characterOpts = Object.assign({}, CharacterType[selectedBuilding.characterType]);
    characterOpts.color = player.color;
    characterOpts.position = player.position;
    characterOpts.faction = player.faction;

    return new Building(characterOpts);
}

const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    visible: false,
    menuAction: Build
});

Events.Subscribe(Events.List.BuildingDesired, function (desire) {

    desireLabels[desire] = UI_MENU_BUILDINGS.addLabel({
        name: `${desire.name} desired`,
    })
});

Events.Subscribe(Events.List.BuildingDesireFulfilled, function (desire) {

    console.log("filling desire...");
    UI_MENU_BUILDINGS.removeItem(desireLabels[desire]);
    delete desireLabels[desire];
});

// TODO: Later, generically unlock items in menus by having them locked/unlocked
// TODO: get "Food" from its proper definition, or a constant somewhere ... 
Events.Subscribe(`${Events.List.ResearchFinished}-Food`, function () {

    const seeder = UI_MENU_BUILDINGS.addItem(CharacterType.Seeder);
    seeder.Element.innerHTML = `Desire ${CharacterType.Seeder.name}`;
    const eater = UI_MENU_BUILDINGS.addItem(CharacterType.Eater);
    eater.Element.innerHTML = `Desire ${CharacterType.Eater.name}`;
});

KeyboardController.AddDefaultBinding("openMenu/build", "b");

/* Buildings data begin */

// TODO: import from json, or ... ?
new CharacterType({
    name: 'Seeder',
    health: 15,
    _currentPurposeKey: 'grow',
    growConfig: {
        subject: CharacterType.Food,
        max: 8, // once 8 are grown, don't start any more
        batchSize: 4,   // grow 4 at a time
        interval: 10000 // how long does it take to fully grow 1 food?
    },
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
    ai: NodeAI
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

// rock driller

// building for sending research home

// building for receiving research from home
