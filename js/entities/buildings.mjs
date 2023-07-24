import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Events from '../../engine/js/events.mjs';
import Chunk from '../../engine/js/mapping/chunk.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';
import HiveMindCharacter from './character-extensions.mjs';

// TODO: import from json, or ... ?
new CharacterType({
    name: 'Seeder',
    color: 'blue',  // player color
    health: 15,
    ai: null
});

const Build = function(context) {

    const selectedBuilding = context?.menu?.selected?.context;

    console.log("I gonna build this guy:");
    console.log(selectedBuilding);

    // for now we can just spawn our first building
    // which will produce seeds, which eventually grow into fruit you can eat

    const player = Character.LOCAL_PLAYER;

    // check cost (player can "afford") before building
    // instantiate the instance

    // TODO: from selected
    // TODO: Why does the seeder move?
        const spawnedCharacter = new HiveMindCharacter({
            name: 'Seeder',
            color: `blue`,  // player color
            health: 15,
            position: player.position,
            _currentPurposeKey: 'grow'
        });
}

const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    visible: false,
    menuAction: Build
});

export default class Building extends Character {
    
    constructor(options) {

        super(options);

        UI_MENU_BUILDINGS.addItem(this);
    }
}
