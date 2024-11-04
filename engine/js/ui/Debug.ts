import { RegisterLoopMethod } from "../Loop";
import UIElement, { SCREEN_ZONE } from "./ui-element";

const trackedFunctions: StringFunction[] = [];

export type StringFunction = () => string | number;

/*
    text?: string;
    parent?: UIElement;
    screenZone?: SCREEN_ZONE;
    visible?: boolean;
    classes?: string[];
    elementType?: UI_ELEMENT_TYPE;
    customAction?: (event: Event) => void;
    title?: string;
    */

const DEBUG_PANEL = new UIElement({
    classes: ["debug"],
    screenZone: SCREEN_ZONE.MIDDLE_LEFT,
});

function Track(func: StringFunction, stringFormat?: string) {
    trackedFunctions.push(func);
    // TODO: create watch method for object parameter
}

function Write(str: string) {
    DEBUG_PANEL.text = str;
}

const Debug = {
    Write,
    Track
}

function updateTrackedObjects() {
    let str = '';
    for(const func of trackedFunctions) {
        str += func() + '\n';
    }
    if(str != '') DEBUG_PANEL.text = str;
}

RegisterLoopMethod(updateTrackedObjects);

export default Debug;
