import Character from './character.mjs';
import Events from '../events.mjs';
import { RegisterLoopMethod } from './../loop.mjs';
import Renderer from '../rendering/renderer.mjs';

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

// TODO: needs redraw
function redraw(character, screenRect) {

    if(!character.graphic) createGraphic(character);

    // TODO: get grid size constant
    const gridSize = 32;

    // TODO: Not this
    const MINIMUM_SIZE = gridSize / 2;

    const offsetPosition = {
        x: character.position.x - screenRect.x,
        y: character.position.y - screenRect.y
    };

    character.graphic.style.left = (gridSize * offsetPosition.x) + "px";
    character.graphic.style.top = (gridSize * offsetPosition.y) + "px";

    // Find a different way to determine sizes ... or health proportions
    let targetSize = (character.health / 40) * gridSize;
    if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
    character.graphic.style.width = targetSize + "px";
    character.graphic.style.height = targetSize + "px";
}

function redraw_loop(screenRect) {

    for(var character of CHARACTER_LIST) {
        // if character in screenRect
        redraw(character, screenRect);
    }
}

Events.Subscribe(Events.List.GameStart, function() {
    // Events.Subscribe(Events.List.CharacterCreated, createGraphic);
    
    Events.Subscribe(Events.List.CharacterTargetChanged, updateTargetingClasses);
});

Renderer.RegisterRenderMethod(10, redraw_loop);

// RegisterLoopMethod(redraw_loop, true);
