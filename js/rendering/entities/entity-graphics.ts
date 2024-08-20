import Rectangle from '../../baseTypes/rectangle';
import Events from '../../events';
import Renderer from '../renderer';
import Character from '../../entities/character';
import Entity, { EntityEvent } from '../../entities/character/Entity';
import { CharacterTargetChangedEvent } from '../../entities/character/mixins/Combative';
import { IsLiving, Living } from '../../entities/character/mixins/Living';
import { CHARACTER_LIST } from '../../entities/characters';

const entityGraphics = new Map<Entity, HTMLElement>();

export function GetEntityGraphic(entity: Entity) {
    return entityGraphics.get(entity);
}

function createGraphic(entity: Entity) {

    // TODO: migrate type to entity
    const character = entity as Character;
    const graphic = document.createElement('div');
    entityGraphics.set(entity, graphic);
    graphic.className = 'character';
    if (IsLiving(entity) && (entity as Living).isAlive) graphic.className += ' alive';
    setColor(character);

    if (character.additionalClasses) graphic.className += " " + character.additionalClasses;

    if(entity.entityRenderingSettings) {
        if(entity.entityRenderingSettings.renderedName) {
            graphic.innerHTML = entity.entityRenderingSettings.renderedName;
        }
    }

    // TODO: This playfield reference should probably be stored somewhere more globally referencable
    document.getElementById("playfield").appendChild(graphic);
}

function setColor(character: Character) {

    const graphic = entityGraphics.get(character);
    let color;
    if(character.color) color = character.color;
    else if(character?.faction?.color) color = character.faction.color;

    if(color?.indexOf("rgb") > -1) {
        graphic.style.backgroundColor = color;
    } else if(color) {
        graphic.className += ` ${color}`;
    }
}

function updateTargetingClasses(event: CharacterTargetChangedEvent) {

    if(!event.character.isPlayer) return;

    if(event.to instanceof Entity) {
        addClass(event.to, "targeted");
    }

    if(event.from instanceof Entity) {
        removeClass(event.from, "targeted");
    }
}

function addClass(entity: Entity, className: string) {
    const graphic = entityGraphics.get(entity);
    if(graphic) graphic.className += ` ${className}`;
}

function removeClass(entity: Entity, className: string) {
    const graphic = entityGraphics.get(entity);
    if(graphic) graphic.className = graphic.className.replace(className, "").trim();
}

function redraw(entity: Entity, screenRect: Rectangle) {

    // how to check if the character is off screen?

    if(!entityGraphics.has(entity)) createGraphic(entity);
    const graphic = entityGraphics.get(entity);

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

    graphic.style.left = (gridSize * offsetPosition.x) + "px";
    graphic.style.top = (gridSize * offsetPosition.y) + "px";

    if(IsLiving(entity)) {
        // Find a different way to determine sizes ... or health proportions
        let targetSize = (entity.health / 40) * gridSize;
        if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
        graphic.style.width = targetSize + "px";
        graphic.style.height = targetSize + "px";
    } else {
        // we need to implement this alternative, but we can avoid it for now
        console.warn('this guy aint livin');
    }
}

function redraw_loop(screenRect: Rectangle) {

    // despite the name, these are entities
    for(var character of CHARACTER_LIST) {
        // if character in screenRect
        redraw(character, screenRect);
    }
}

function characterDied(event: EntityEvent) {
    const entity = event.entity;
    const graphic = entityGraphics.get(entity);
    if(graphic) {
        document.getElementById("playfield").removeChild(graphic);
        entityGraphics.delete(entity);
    }
}

Events.Subscribe(Events.List.GameStart, function() {
    
    Events.Subscribe(Events.List.CharacterTargetChanged, updateTargetingClasses);
    Events.Subscribe(Events.List.CharacterDied, characterDied);
});

Renderer.RegisterRenderMethod(10, redraw_loop);
