import { CharacterUtils } from "../../engine/js/entities/character/CharacterUtils";
import Entity from "../../engine/js/entities/character/Entity";
import CanvasRenderingContext from "../../engine/js/rendering/contexts/CanvasRenderingContext";
import { FLAG_SKIP_DOM_RENDERING, RemoveEntityGraphic } from "../../engine/js/rendering/entities/entity-graphics";

let localPlayer: Entity;

function redraw_loop(canvas: HTMLCanvasElement) {

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    if(!localPlayer) {
        onGameStart();
        return;
    };

    const boxSize = 100;
    const color = 'green'// localPlayer.color;

    const x = (context.canvas.width - boxSize) / 2;
    const y = (context.canvas.height - boxSize) / 2;// Set fill style to green with semi transparency

    context.globalAlpha = 0.5; // Adjust this value between 0 (fully transparent) and 1 (fully opaque) to get the desired transparency
    context.fillStyle = color;
    context.fillRect(x, y, boxSize, boxSize);

    // Reset globalAlpha to have a solid outline
    context.globalAlpha = 1;
    context.strokeStyle = color;
    context.lineWidth = 2; // Set line width for the stroke
    context.strokeRect(x, y, boxSize, boxSize); // Draw the outline
}

function onGameStart() {
    localPlayer = CharacterUtils.GetLocalPlayer();
    if(localPlayer) {
        RemoveEntityGraphic(localPlayer);
        localPlayer.addFlag(FLAG_SKIP_DOM_RENDERING);
    }
}

CanvasRenderingContext.RegisterRenderMethod(10, redraw_loop);
