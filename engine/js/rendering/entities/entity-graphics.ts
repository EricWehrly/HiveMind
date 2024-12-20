import Rectangle from '../../baseTypes/rectangle';
import Events from '../../events';
import Character from '../../entities/character';
import Entity, { EntityEvent } from '../../entities/character/Entity';
import { Combative } from '../../entities/character/mixins/Combative';
import { IsLiving, Living } from '../../entities/character/mixins/Living';
import DomRenderingContext from '../contexts/DomRenderingContext';
import { CARDINAL_DIRECTION } from '../../baseTypes/Vector';
import { CharacterUtils } from '../../entities/character/CharacterUtils';
import { CharacterTargetChangedEvent } from '../../ai/basic';
import Camera from '../../camera';
import Renderer from '../renderer';

const entityGraphics = new Map<Entity, HTMLElement>();

export function GetEntityGraphic(entity: Entity) {
    return entityGraphics.get(entity);
}

export const FLAG_SKIP_DOM_RENDERING = 'noGraphic';

function createGraphic(entity: Entity, domRoot: HTMLElement) {

    // TODO: migrate type to entity
    const character = entity as Character & Combative;
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

    domRoot.appendChild(graphic);
    // @ts-expect-error     // easy 'hook' to debug
    entity._element = graphic;
}

function setColor(character: Character & Combative) {

    const graphic = entityGraphics.get(character);
    let color;
    if(character.color) color = character.color;
    else if(character?.faction?.color) color = character.faction.color;

    if(color && color.indexOf("rgb") > -1) {
        graphic.style.backgroundColor = color;
    } else if(color) {
        graphic.className += ` ${color}`;
    }
}

function updateTargetingClasses(event: CharacterTargetChangedEvent) {

    if(!CharacterUtils.IsLocalPlayer(event.character)) return;

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

function hasClass(entity: Entity, className: string) {
    const graphic = entityGraphics.get(entity);
    if(!graphic) return false;
    return graphic.className.indexOf(className) > -1;
}

function hasAnyClass(entity: Entity, classNames: string[]) {
    const graphic = entityGraphics.get(entity);
    if(!graphic) return false;
    for(var className of classNames) {
        if(graphic.className.indexOf(className) > -1) return true;
    }
    return false;
}

function redraw(entity: Entity, screenRect: Rectangle, domRoot: HTMLElement) {

    // how to check if the character is off screen?

    // TODO: pre-cache this for redraw loop
    if(entity.hasFlag(FLAG_SKIP_DOM_RENDERING)) return;

    if(!entityGraphics.has(entity)) createGraphic(entity, domRoot);
    const graphic = entityGraphics.get(entity);
    
    if(CharacterUtils.IsLocalPlayer(entity)) {
        dom_handle_facing(entity);
    }

    // TODO: We could implement some "dirtying" to skip the whole method if not needed
    // but even static characters need to be redrawn when screenRect moves

    // TODO: Not this
    const MINIMUM_SIZE = Renderer.GRID_SIZE / 2;

    const entityScreenPosition = Camera.get().GameToScreenCoords(entity.position);

    graphic.style.left = (entityScreenPosition.x) + "px";
    graphic.style.top = (entityScreenPosition.y) + "px";

    if(IsLiving(entity)) {
        // Find a different way to determine sizes ... or health proportions
        let targetSize = (entity.health / 40) * Renderer.GRID_SIZE;
        if (targetSize < MINIMUM_SIZE) targetSize = MINIMUM_SIZE;
        graphic.style.width = targetSize + "px";
        graphic.style.height = targetSize + "px";
    } else {
        // we need to implement this alternative, but we can avoid it for now
        console.warn('this guy aint livin');
    }

    // debug info
    /*
    const localPlayer = CharacterUtils.GetLocalPlayer() as Entity & Combative;;
    const combativeEntity = entity as Entity & Combative;
    if(localPlayer.faction.equals(combativeEntity.faction)) {
        graphic.innerText = combativeEntity.desiredMovementVector.toString();
    }
        */
}

function dom_handle_facing(entity: Entity) {

    const cardinals: string[] = Object.keys(CARDINAL_DIRECTION).filter(key => isNaN(Number(key)));
    const facingIndex = entity.facing.cardinalDirection;
    const facing = cardinals[facingIndex];

    if(hasClass(entity, facing)) return;

    if(hasAnyClass(entity, cardinals)) {
        for(var cardinal of cardinals) {
            removeClass(entity, cardinal);
        }
    }
    addClass(entity, facing);
}

function redraw_loop(screenRect: Rectangle, domRoot: HTMLElement) {

    // despite the name, these are entities
    for(var character of Entity.List) {
        // if character in screenRect
        redraw(character, screenRect, domRoot);
    }
}

export function RemoveEntityGraphic(entity: Entity) {
    const graphic = entityGraphics.get(entity);
    if(graphic) {
        graphic.parentNode.removeChild(graphic);
        entityGraphics.delete(entity);
    }
}

function characterDied(event: EntityEvent) {
    RemoveEntityGraphic(event.entity);
}

Events.Subscribe(Events.List.GameStart, function() {
    
    Events.Subscribe(Events.List.CharacterTargetChanged, updateTargetingClasses);
    Events.Subscribe(Events.List.CharacterDied, characterDied);
});

DomRenderingContext.RegisterRenderMethod(10, redraw_loop);
