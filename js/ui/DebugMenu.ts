import Configuration from "../../engine/js/core/Configuration";
import Renderer from "../../engine/js/rendering/renderer";
import Debug from "../../engine/js/ui/Debug";
import MenuItem from "../../engine/js/ui/MenuItem";
import Menu from "../../engine/js/ui/menu";
import { SCREEN_ZONE, UI_ELEMENT_TYPE } from "../../engine/js/ui/ui-element";
import KeyboardController from "../controls/KeyboardController";

interface MenuContext {
    menu: Menu
}

function toggleLevelMetaDrawing() {
    Configuration.Set("debug.drawLevelMeta", !Configuration.Get("debug.drawLevelMeta"));
}

function debugMenuAction(context: MenuContext) {
    const item = context.menu.selected;
    if(item.context.callback) item.context.callback.bind(item)();
}

// TODO: initial value from config
const debugMenu = new Menu({
    screenZone: SCREEN_ZONE.MIDDLE_LEFT,
    name: "Debug",
    menuAction: debugMenuAction
});

new MenuItem({
    menu: debugMenu,
    name: 'Draw metadata on level',
    elementType: UI_ELEMENT_TYPE.Checkbox,
    customAction: toggleLevelMetaDrawing
});

// TODO: find a better home for this ...
Debug.Track(Renderer.GetFramesPerSecond, 'FPS: {0}');
Debug.Track(Renderer.GetMedianFrameTime, 'Median frame time: {0}ms');
Debug.Track(Renderer.GetMaxFrameTime, 'Max frame time: {0}ms');

KeyboardController.AddDefaultBinding("openMenu/Debug", "`");

import './DebugMenuTiming';
