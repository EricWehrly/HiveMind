import Events from '../events.mjs';
import Renderer from '../rendering/renderer.mjs';
import Entity from './character/Entity.ts';

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

    if(event.to instanceof Entity) {
        addClass(event.to, "targeted");
    }

    if(event.from instanceof Entity) {
        removeClass(event.from, "targeted");
    }
}

function addClass(entity, className) {
    if(entity.graphic) entity.graphic.className += ` ${className}`;
}

function removeClass(entity, className) {
    if(entity.graphic) entity.graphic.className = entity.graphic.className.replace(className, "").trim();
}

function redraw(entity, screenRect) {

    // how to check if the character is off screen?

    if(!entity.graphic) createGraphic(entity);

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

    // TODO: get grid size constant
    const gridSize = 32;

    // TODO: Not this
    const MINIMUM_SIZE = gridSize / 2;

    const offsetPosition = {
        x: entity.position.x - screenRect.x,
        y: entity.position.y - screenRect.y
    };

    entity.graphic.style.left = (gridSize * offsetPosition.x) + "px";
    entity.graphic.style.top = (gridSize * offsetPosition.y) + "px";

    // Find a different way to determine sizes ... or health proportions
    let targetSize = (entity.health / 40) * gridSize;
    if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
    entity.graphic.style.width = targetSize + "px";
    entity.graphic.style.height = targetSize + "px";
}

function redraw_loop(screenRect) {

    // despite the name, these are entities
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
