
import Rectangle from "../../baseTypes/rectangle";
import { CharacterUtils } from "../../entities/character/CharacterUtils";
import { UI_ELEMENT_ATTACK } from "../../ui/ui-equipment";
import Renderer from "../renderer";
import { GetDomForUIElement } from "./ui-element-renderer";

let backgroundDirty = false;

function redraw(screenRect: Rectangle) {
    const playerAttack = CharacterUtils.GetPlayerEquippedAttack();
    if(playerAttack && !playerAttack.ready) {
        backgroundDirty = true;
        let progress = (performance.now() - playerAttack.lastFired) / playerAttack.technology.delay;
        progress = Math.floor(Math.min(1, progress) * 100);
        const background = `linear-gradient(to right, rgba(0, 0, 0, 0.9) ${progress}%, rgba(0, 0, 0, 0) 100%)`;
        const element = GetDomForUIElement(UI_ELEMENT_ATTACK);
        element.style.background = background;
    }

    else if(backgroundDirty) {
        const element = GetDomForUIElement(UI_ELEMENT_ATTACK);
        element.style.background = "";
        backgroundDirty = false;
    }
};

Renderer.RegisterRenderMethod(10, redraw);
