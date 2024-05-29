import Character from './character.ts';
import Events from '../events.mjs';
import Renderer from '../rendering/renderer.mjs';

function createGraphic(character) {

    character.graphic = document.createElement('div');
    character.graphic.className = 'character';
    if (character.isAlive) character.graphic.className += ' alive';
    setColor(character);

    if (character.additionalClasses) character.graphic.className += " " + character.additionalClasses;

    // TODO: This playfield reference should probably be stored somewhere more globally referencable
    document.getElementById("playfield").appendChild(character.graphic);
}

function setColor(character) {

    let color;
    if(character.color) color = character.color;
    else if(character?.faction?.color) color = character.faction.color;

    if(color?.indexOf("rgb") > -1) {
        character.graphic.style.backgroundColor = color;
    } else if(color) {
        character.graphic.className += ` ${color}`;
    }
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
    if(character.graphic) character.graphic.className += ` ${className}`;
}

function removeClass(character, className) {
    if(character.graphic) character.graphic.className = character.graphic.className.replace(className, "").trim();
}

function redraw(character, screenRect) {

    if(!character.graphic) createGraphic(character);

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

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

function characterDied(entity) {
    if(entity.graphic) {
        document.getElementById("playfield").removeChild(entity.graphic);
        delete entity.graphic;
    }
}

Events.Subscribe(Events.List.GameStart, function() {
    
    Events.Subscribe(Events.List.CharacterCreated, createGraphic);
    Events.Subscribe(Events.List.CharacterTargetChanged, updateTargetingClasses);
    Events.Subscribe(Events.List.CharacterDied, characterDied);
});

Renderer.RegisterRenderMethod(10, redraw_loop);
