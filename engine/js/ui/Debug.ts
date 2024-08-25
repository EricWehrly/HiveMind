import UIElement, { SCREEN_ZONE } from "./ui-element";

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

function Track(obj: any, stringFormat: string) {
    // TODO: create watch method for object parameter
}

function Write(str: string) {
    DEBUG_PANEL.setText(str);
}

const Debug = {
    Write,
    Track
}

export default Debug;
