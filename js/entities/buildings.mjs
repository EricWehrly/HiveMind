import Character from '../../engine/js/entities/character.ts';
import CharacterType from './CharacterType.ts';
import Menu from '../../engine/js/ui/menu.ts';
import UIElement from '../../engine/js/ui/ui-element.ts';
import KeyboardController from '../controls/keyboard-controller.mjs';
import Events from '../../engine/js/events.ts';
import NodeAI from '../ai/node.ts';
import Building from './building.ts';

const desireLabels = {};

const BuildFromMenu = function (context) {

    const selectedBuilding = context?.menu?.selected?.context;

    const characterType = selectedBuilding.characterType 
        || CharacterType.List[selectedBuilding.characterTypeName || selectedBuilding.name];

    if (characterType.name != "Node") {

        NodeAI.QueueDesire(characterType);
        return;
    }

    const player = Character.LOCAL_PLAYER;

    const options = {
        position: player.position,
        faction: player.faction
    }

    Building.Build(characterType, options);
}

// maybe it's time to extract a 'buildingMenu' file
const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    visible: false,
    menuAction: BuildFromMenu
});

const addBuildItem = function(itemType) {
    
    return UI_MENU_BUILDINGS.addItem({
        characterTypeName: itemType.characterType.name,
        section: 'available'
    });
}

Events.Subscribe(Events.List.BuildingDesired, function (desire) {

    desireLabels[desire] = UI_MENU_BUILDINGS.addLabel({
        name: `${desire.name} desired`,
        section: 'desired'
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

    const seeder = addBuildItem(CharacterType.List['Seeder']);
    seeder.Element.innerHTML = `Desire ${CharacterType.List['Seeder'].name}`;
    const eater = addBuildItem(CharacterType.List['Eater']);
    eater.Element.innerHTML = `Desire ${CharacterType.List['Eater'].name}`;
});

KeyboardController.AddDefaultBinding("openMenu/build", "b");

/* Buildings data begin */

// TODO: import from json, or ... ?
new CharacterType({
    name: 'Seeder',
    health: 15,
    _currentPurposeKey: 'grow',
    growerConfig: {
        subject: CharacterType.List['Food'],
        max: 8, // once 8 are grown, don't start any more
        batchSize: 4,   // grow 4 at a time
        interval: 10000 // how long does it take to fully grow 1 food?
    },
    overlapRange: 3,
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
    ai: NodeAI,
    range: 4
});
addBuildItem(CharacterType.List['Node']);

new CharacterType({
    name: 'Hunter',
    health: 30,
    _currentPurposeKey: 'spawn',
    _spawnPurposeKey: 'hunt',
    ai: null
});
// TODO: TBH it doesn't feel "right" to put the 'desire' buildings with the actually 'available' ones
const hunterMenuItem = addBuildItem(CharacterType.List['Hunter']);
hunterMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Hunter'].name}`;

// TODO: Make these actually contribute to a research speed multiplier
// ideally render that somewhere
new CharacterType({
    name: 'Researcher',
    health: 50,
    ai: null
});
const researcherMenuItem = addBuildItem(CharacterType.List['Researcher']);
researcherMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Researcher'].name}`;

new CharacterType({
    name: 'Healer',
    health: 30,
    _currentPurposeKey: 'heal',
    ai: null
});
const healerMenuItem = addBuildItem(CharacterType.List['Healer']);
healerMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Healer'].name}`;

// rock driller

// building for sending research home

// building for receiving research from home
