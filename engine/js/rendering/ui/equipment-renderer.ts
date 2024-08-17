
import Rectangle from "../../baseTypes/rectangle";
import { GetPlayerEquippedAttack } from "../../entities/character/CharacterUtils";
import { UI_ELEMENT_ATTACK } from "../../ui/ui-equipment";
import Renderer from "../renderer";

function redraw(screenRect: Rectangle) {
    const playerAttack = GetPlayerEquippedAttack();
    if(playerAttack && !playerAttack.ready) {
        let progress = (performance.now() - playerAttack.lastFired) / playerAttack.technology.delay;
        progress = Math.floor(Math.min(1, progress) * 100);
        const background = `linear-gradient(to right, rgba(0, 0, 0, 0.9) ${progress}%, rgba(0, 0, 0, 0) 100%)`;
        UI_ELEMENT_ATTACK.Element.style.background = background;
    }
};

Renderer.RegisterRenderMethod(10, redraw);
