import Character from './character.mjs';
import Events from '../events.mjs';
import { RegisterLoopMethod } from './../loop.mjs';

function createGraphic(character) {

    character.graphic = document.createElement('div');
    character.graphic.className = 'character';
    // if(this.color) this.graphic.style.backgroundColor = this.color;
    if (character.color) character.graphic.className += ` ${character.color}`;
    if (character.isAlive) character.graphic.className += ' alive';

    if (character.additionalClasses) character.graphic.className += " " + character.additionalClasses;

    // TODO: This playfield reference should probably be stored somewhere more globally referencable
    document.getElementById("playfield").appendChild(character.graphic);
}

function updateTargetingClasses(event) {

    if(!event.character.isPlayer) return;

    if(event.to instanceof Character) {
        addClass(event.to, "targeted");
    }

    if(event.from instanceof Character) {
        removeClass(event.from, "targeted");
    }
}

function addClass(character, className) {
    character.graphic.className += ` ${className}`;
}

function removeClass(character, className) {
    character.graphic.className = character.graphic.className.replace(className, "").trim();
}

function redraw(character) {

    if(!character.graphic) createGraphic(character);

    // TODO: get grid size constant
    const gridSize = 32;

    // TODO: Not this
    const MINIMUM_SIZE = gridSize / 2;

    // maybe the playfield should move and the player should stay centered ...
    character.graphic.style.left = (gridSize * character.position.x) + "px";
    character.graphic.style.top = (gridSize * character.position.y) + "px";

    // TODO: Only change on resize ...

    // Find a different way to determine sizes ... or health proportions
    let targetSize = (character.health / 40) * gridSize;
    if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
    character.graphic.style.width = targetSize + "px";
    character.graphic.style.height = targetSize + "px";
}

function redraw_loop() {

    for(var character of CHARACTER_LIST) {
        redraw(character);
    }
}

Events.Subscribe(Events.List.GameStart, function() {
    // Events.Subscribe(Events.List.CharacterCreated, createGraphic);
    
    Events.Subscribe(Events.List.CharacterTargetChanged, updateTargetingClasses);
});

RegisterLoopMethod(redraw_loop, true);
