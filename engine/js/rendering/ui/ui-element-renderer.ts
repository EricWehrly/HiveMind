import Rectangle from "../../baseTypes/rectangle";
import UIElement from "../../ui/ui-element";
import { GetEntityGraphic } from "../entities/entity-graphics";
import Renderer from "../renderer";

function ui_loop(screenRect: Rectangle) {

    // TODO: mark 'dirty' to skip this loop if nothing has changed
    for(var element of UIElement.UI_ELEMENTS) {
        redraw(element, screenRect);
    }
}

function redraw(uiElement: UIElement, screenRect: Rectangle) {
    
    const entityGraphic = GetEntityGraphic(uiElement.entity);

    if(entityGraphic) {

        // TODO: get grid size constant
        const gridSize = 32;

        const entityHeight: number = entityGraphic.offsetHeight;
        const offsetPosition = {
            x: uiElement.entity.position.x - screenRect.x,
            y: uiElement.entity.position.y - screenRect.y
        };
        let targetY = gridSize * offsetPosition.y;
        if(entityGraphic?.style?.height) {
            // multiply height for some reason
            targetY -= (1.5 * entityHeight);
        }

        uiElement.Element.style.left = (gridSize * offsetPosition.x) + "px";
        uiElement.Element.style.top = targetY + "px";
    }
}

Renderer.RegisterRenderMethod(10, ui_loop);
