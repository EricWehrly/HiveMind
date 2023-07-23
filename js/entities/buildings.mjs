import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Events from '../../engine/js/events.mjs';
import Chunk from '../../engine/js/mapping/chunk.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';

// TODO: import from json, or ... ?
new CharacterType({
    name: 'Seeder',
    color: 'blue',  // player color
    health: 15,
    ai: null
});

const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build"
});

export default class Building extends Character {
    
    constructor(options) {

        super(options);

        // add to global buildings list, which adds to menu
        UI_MENU_BUILDINGS.addItem(this);
    }
    
}
