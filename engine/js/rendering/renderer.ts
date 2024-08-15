import Rectangle from "../baseTypes/rectangle";
import { generateId } from "../util/javascript-extensions.mjs";

export interface RenderMethodConstructorOptions {
    frameLimit?: number;
    layer?: string;
}

interface RenderMethodOptions {
    frameLimit: number;
    layer: string;
    method: Function;
    id: string;
}

export default class Renderer {

    static _renderMethods: RenderMethodOptions[] = [];
    static #renderMethodPriorities: { [key: number]: RenderMethodOptions } = {};

    static Render(screenRect: Rectangle) { }

    static RegisterRenderMethod(priority: number, method: Function, options?: RenderMethodConstructorOptions) {

        const methodPriorityOptions = Renderer.#registerRenderMethod_defaultOptions(options);
    
        while(priority in Renderer.#renderMethodPriorities) {
            priority = priority + 1;
        }
        methodPriorityOptions.method = method;
        Renderer.#renderMethodPriorities[priority] = methodPriorityOptions;
    
        Renderer.#reprioritizeRendering();
    
        return methodPriorityOptions.id;
    }

    static #registerRenderMethod_defaultOptions = function(options?: RenderMethodConstructorOptions) {

        const methodPriorityOptions: RenderMethodOptions = {
            layer: options?.layer || "main",
            frameLimit: options?.frameLimit || -1,
            id: generateId(6),
            method: function() {}
        };
    
        return methodPriorityOptions;
    }

    static #reprioritizeRendering = function() {
    
        Renderer._renderMethods = [];
        for(var priorityIndex in Renderer.#renderMethodPriorities) {
            Renderer._renderMethods.push(Renderer.#renderMethodPriorities[priorityIndex]);
        }
    }
}