import Character from './character-extensions.mjs';
import CharacterType from './characterType.mjs';
import Events from '../../engine/js/events.mjs';
import Chunk from '../../engine/js/mapping/chunk.mjs';
import Menu from '../../engine/js/ui/menu.mjs';
import UIElement from '../../engine/js/ui/ui-element.mjs';

new CharacterType({
    name: 'Seeder',
    color: 'blue',  // player color
    health: 5,
    ai: null
});

const UI_MENU_BUILDINGS = new Menu({
    screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
    name: "Build"
});

export default class Building {
}
