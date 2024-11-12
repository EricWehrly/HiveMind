import { RegisterLoopMethod } from "../Loop";
import UIElement, { SCREEN_ZONE } from "./ui-element";

export type StringFunction = () => string | number;

const trackedFunctions: Record<string, { func: StringFunction, formatTemplate: string }> = {};

const DEBUG_PANEL = new UIElement({
    classes: ["debug"],
    screenZone: SCREEN_ZONE.MIDDLE_LEFT,
});

/**
 * 
 * @param func the result of this function will be rendered
 * @param formatTemplate (optional) use '(0)' where you would like to insert the result of the function into the string template
 */
function Track(func: StringFunction, formatTemplate?: string) {
    if(func?.name?.length === 0 || !func) {
        console.warn('Cannot track function without a name');
    } else if(trackedFunctions[func.name]) {
        console.warn(`Function ${func.name} is already being tracked`);
    } else {
        trackedFunctions[func.name] = { func, formatTemplate };
    }
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
    for (const key in trackedFunctions) {
        if (trackedFunctions.hasOwnProperty(key)) {
            const { func, formatTemplate } = trackedFunctions[key];
            // TODO: Each time that we retrieve the value, 
            // we can hold onto it to be able to render charts
            let result = func();
            if(typeof result === 'number') {
                result = result.toFixed(2);
            }
            if(formatTemplate) {
                const formattedString = stringFormat(formatTemplate, result);
                str += formattedString + '<br/>';
            } else {
                str += result + '<br/>';
            }
        }
    }
    if (str !== '') DEBUG_PANEL.text = str;
}

function stringFormat(template: string, ...args: any[]): string {
    return template.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
}

RegisterLoopMethod(updateTrackedObjects);

export default Debug;
