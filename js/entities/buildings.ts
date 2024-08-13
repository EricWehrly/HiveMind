import Character from '../../engine/js/entities/character';
import CharacterType from './CharacterType';
import Menu from '../../engine/js/ui/menu';
import { SCREEN_ZONE } from '../../engine/js/ui/ui-element';
import KeyboardController from '../controls/keyboard-controller.mjs';
import Events from '../../engine/js/events';
import NodeAI from '../ai/node';
import Building from './building';
import MenuItem, { MenuItemType } from '../../engine/js/ui/MenuItem';

const desireLabels: Map<string, MenuItem> = new Map();

const BuildFromMenu = function (context: { menu: Menu }) {

    const menuItem = context?.menu?.selected;

    const characterType = CharacterType.List[menuItem.characterTypeName || menuItem.name];

    if (characterType.name != "Node") {

        NodeAI.QueueDesire(characterType);
        return;
    }

    const player = Character.LOCAL_PLAYER as Character;

    const options = {
        position: player.position,
        faction: player.faction
    }

    Building.Build(characterType, options);
}

// maybe it's time to extract a 'buildingMenu' file
const UI_MENU_BUILDINGS = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    visible: false,
    menuAction: BuildFromMenu
});

const addBuildItem = function(itemType: CharacterType) {

    return new MenuItem({
        menu: UI_MENU_BUILDINGS,
        characterTypeName: itemType.characterType.name,
        section: 'available'
    });
}

Events.Subscribe(Events.List.BuildingDesired, function (desire: CharacterType) {

    const menuItem = new MenuItem({
        menu: UI_MENU_BUILDINGS,
        menuItemType: MenuItemType.Label,
        name: `${desire.name} desired`,
        section: 'desired'
    });
    desireLabels.set(desire.name, menuItem);
});

Events.Subscribe(Events.List.BuildingDesireFulfilled, function (desire: CharacterType) {

    console.log("filling desire...");
    UI_MENU_BUILDINGS.removeItem(desireLabels.get(desire.name));
    desireLabels.delete(desire.name);
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
    context: {
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
    }
});

// this probably needs to express a (max) distance
new CharacterType({
    name: 'Eater',
    context: {
        health: 40,
        _currentPurposeKey: 'spawn',
        _spawnPurposeKey: 'consume',
        ai: null
    }
});

new CharacterType({
    name: 'Node',
    context: {
        health: 40,
        ai: NodeAI,
        range: 4
    }
});
addBuildItem(CharacterType.List['Node']);

new CharacterType({
    name: 'Hunter',
    context: {
        health: 30,
        _currentPurposeKey: 'spawn',
        _spawnPurposeKey: 'hunt',
        ai: null
    }
});
// TODO: TBH it doesn't feel "right" to put the 'desire' buildings with the actually 'available' ones
const hunterMenuItem = addBuildItem(CharacterType.List['Hunter']);
hunterMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Hunter'].name}`;

// TODO: Make these actually contribute to a research speed multiplier
// ideally render that somewhere
new CharacterType({
    name: 'Researcher',
    context: {
        health: 50,
        ai: null
    }
});
const researcherMenuItem = addBuildItem(CharacterType.List['Researcher']);
researcherMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Researcher'].name}`;

new CharacterType({
    name: 'Healer',
    context: {
        health: 30,
        _currentPurposeKey: 'heal',
        ai: null
    }
});
const healerMenuItem = addBuildItem(CharacterType.List['Healer']);
healerMenuItem.Element.innerHTML = `Desire ${CharacterType.List['Healer'].name}`;

// rock driller

// building for sending research home

// building for receiving research from home
