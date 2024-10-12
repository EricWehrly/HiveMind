import CharacterType, { CharacterTypeOptions } from './CharacterType';
import Menu, { MenuAction } from '../../engine/js/ui/menu';
import { SCREEN_ZONE, UI_ELEMENT_TYPE } from '../../engine/js/ui/ui-element';
import KeyboardController from '../controls/KeyboardController';
import Events from '../../engine/js/events';
import NodeAI, { BuildingDesiredEvent } from '../ai/node';
import Building, { BuildingCharacterTypeOptions } from './building';
import MenuItem from '../../engine/js/ui/MenuItem';
import MakeCharacterType from './CharacterTypeFactory';
import { Combative } from '../../engine/js/entities/character/mixins/Combative';
import { CharacterUtils } from '../../engine/js/entities/character/CharacterUtils';
import Entity from '../../engine/js/entities/character/Entity';
import { LivingOptions } from '../../engine/js/entities/character/mixins/Living';
import { HivemindCharacterOptions } from './character/HiveMindCharacter';
import { SentientOptions } from '../../engine/js/entities/character/mixins/Sentient';
import { GrowerConfig } from './character/mixins/Grower';

const desireLabels: Map<string, MenuItem> = new Map();

const BuildFromMenu = function (context: MenuAction) {

    const menuItem = context?.menu?.selected;

    const characterType = CharacterType.List[menuItem.characterTypeName || menuItem.name];

    if (characterType.name != "Node") {

        NodeAI.QueueDesire(characterType);
        return;
    }

    const player = CharacterUtils.GetLocalPlayer() as Entity & Combative;

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

export const addBuildItem = function(itemType: CharacterType) {

    return new MenuItem({
        menu: UI_MENU_BUILDINGS,
        characterTypeName: itemType.name,
        section: 'available'
    });
}

Events.Subscribe(Events.List.BuildingDesired, function (event: BuildingDesiredEvent) {

    const menuItem = new MenuItem({
        menu: UI_MENU_BUILDINGS,
        elementType: UI_ELEMENT_TYPE.Label,
        name: `${event.desire.name} desired`,
        section: 'desired'
    });
    desireLabels.set(event.desire.name, menuItem);
});

Events.Subscribe(Events.List.BuildingDesireFulfilled, function (event: BuildingDesiredEvent) {

    console.log("filling desire...");
    UI_MENU_BUILDINGS.removeItem(desireLabels.get(event.desire.name));
    desireLabels.delete(event.desire.name);
});

// TODO: Later, generically unlock items in menus by having them locked/unlocked
// TODO: get "Food" from its proper definition, or a constant somewhere ... 
Events.Subscribe(`${Events.List.ResearchFinished}-Food`, function () {

    const seeder = addBuildItem(CharacterType.List['Seeder']);
    // TODO: see if we can figure this out inside addBuildItem
    seeder.setText(`Desire ${CharacterType.List['Seeder'].name}`);
    const eater = addBuildItem(CharacterType.List['Eater']);
    eater.setText(`Desire ${CharacterType.List['Eater'].name}`);
});

KeyboardController.AddDefaultBinding("openMenu/build", "b");

/* Buildings data begin */

// TODO: import from json, or ... ?

const seederCharacterType: HivemindCharacterOptions & BuildingCharacterTypeOptions & LivingOptions & GrowerConfig & SentientOptions = {
    name: 'Seeder',
        health: 15,
        currentPurposeKey: 'grow',
        subject: CharacterType.List['Food'],
        max: 8, // once 8 are grown, don't start any more
        batchSize: 4,   // grow 4 at a time
        interval: 10000, // how long does it take to fully grow 1 food?
        overlapRange: 3,
        ai: null
};
MakeCharacterType(seederCharacterType as CharacterTypeOptions);

// this probably needs to express a (max) distance
const eaterCharacterType: HivemindCharacterOptions & LivingOptions & SentientOptions = {
    name: 'Eater',
        health: 40,
        currentPurposeKey: 'spawn',
        spawnPurposeKey: 'consume',
        ai: null
}
MakeCharacterType(eaterCharacterType as CharacterTypeOptions);
const nodeCharacterType: HivemindCharacterOptions & LivingOptions & SentientOptions & BuildingCharacterTypeOptions = {
    name: 'Node',
    health: 40,
    ai: NodeAI,
    range: 4
}
MakeCharacterType(nodeCharacterType as CharacterTypeOptions);
addBuildItem(CharacterType.List['Node']);

const hunterCharacterType: HivemindCharacterOptions & LivingOptions & SentientOptions = {
    name: 'Hunter',
        health: 30,
        currentPurposeKey: 'spawn',
        spawnPurposeKey: 'hunt',
        ai: null
};
MakeCharacterType(hunterCharacterType as CharacterTypeOptions);
// TODO: TBH it doesn't feel "right" to put the 'desire' buildings with the actually 'available' ones
const hunterMenuItem = addBuildItem(CharacterType.List['Hunter']);
hunterMenuItem.setText(`Desire ${CharacterType.List['Hunter'].name}`);

// TODO: Make these actually contribute to a research speed multiplier
// ideally render that somewhere
const reasearcherCharacterType: CharacterTypeOptions & LivingOptions & SentientOptions = {
    name: 'Researcher',
        health: 50,
        ai: null
};
MakeCharacterType(reasearcherCharacterType);
const researcherMenuItem = addBuildItem(CharacterType.List['Researcher']);
researcherMenuItem.setText(`Desire ${CharacterType.List['Researcher'].name}`);

const healerCharacterType: HivemindCharacterOptions & LivingOptions & SentientOptions = {
    name: 'Healer',
        health: 30,
        currentPurposeKey: 'heal',
        ai: null
};
MakeCharacterType(healerCharacterType as CharacterTypeOptions);
const healerMenuItem = addBuildItem(CharacterType.List['Healer']);
healerMenuItem.setText(`Desire ${CharacterType.List['Healer'].name}`);

// rock driller

// building for sending research home

// building for receiving research from home
