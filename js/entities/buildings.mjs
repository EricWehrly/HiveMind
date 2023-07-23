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

const Build = function() {

    // TODO: properly get the "active" menu? or?
    const currentMenu = Menu.MENU_LIST[0];
    const selected = currentMenu.selected;

    console.log("I gonna build this guy:");
    console.log(selected);

    // for now we can just spawn our first building
    // which will produce seeds, which eventually grow into fruit you can eat
}

// menu action property?
const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build",
    menuAction: Build
});

export default class Building extends Character {
    
    constructor(options) {

        super(options);

        // add to global buildings list, which adds to menu
        UI_MENU_BUILDINGS.addItem(this);
    }
    
}
