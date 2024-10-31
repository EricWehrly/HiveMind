import { Defer } from "../Loop";
import Camera from "../camera";
import { CharacterAttackEvent } from "../entities/character/mixins/Combative";
import Events from "../events";
import CanvasRenderingContext from "./contexts/CanvasRenderingContext";

const buckets = new Map<string, CharacterAttackEvent>();
const pews = new Map<string, number>();

function redraw_loop(context: CanvasRenderingContext2D) {

    const camera = Camera.get();

    buckets.forEach((event, id) => {

        pews.set(id, (pews.get(id) || 0) + 1);

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
    // @ts-expect-error
    buckets.set(event.eventId, event);
    
    Defer(() => {
        // @ts-expect-error
        const pewCount = pews.get(event.eventId);
        // @ts-expect-error
        console.log(`${event.eventId} ${pewCount} pews`);
        // @ts-expect-error
        pews.delete(event.eventId);
        // @ts-expect-error
        buckets.delete(event.eventId);
    }, 1500);
}

CanvasRenderingContext.RegisterRenderMethod(10, redraw_loop);

Events.Subscribe(Events.List.CharacterAttacking, onCharacterAttacking);

