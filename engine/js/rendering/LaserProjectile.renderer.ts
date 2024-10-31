import { Defer } from "../Loop";
import Camera from "../camera";
import { CharacterAttackEvent } from "../entities/character/mixins/Combative";
import Events from "../events";
import CanvasRenderingContext from "./contexts/CanvasRenderingContext";

const buckets = new Map<string, CharacterAttackEvent>();

function redraw_loop(context: CanvasRenderingContext2D) {

    const camera = Camera.get();

    buckets.forEach((event, id) => {

        const attackerPos = camera.GameToScreenCoords(event.attacker.position);
        const attackedPos = camera.GameToScreenCoords(event.attacked.position);

        context.lineWidth = 1;
        context.strokeStyle = "red";
        context.beginPath();
        context.moveTo(attackerPos.x, attackerPos.y);
        context.lineTo(attackedPos.x, attackedPos.y);
        context.closePath();
        context.stroke();
    });
}

function onCharacterAttacking(event: CharacterAttackEvent) {

    // maybe later we could filter based on the attack range
    // to determine whether we should skip 'melee' attacks for this renderer
    buckets.set(event.eventId, event);
    
    Defer(() => {
        buckets.delete(event.eventId);
    }, 1500);
}

CanvasRenderingContext.RegisterRenderMethod(10, redraw_loop);

Events.Subscribe(Events.List.CharacterAttacking, onCharacterAttacking);
