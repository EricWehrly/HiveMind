import { generateId } from "../util/javascript-extensions.js";

export default class Renderer {

    static _renderMethods = [];
    static #renderMethodPriorities = {};

    static Render(screenRect) {
    }

    static RegisterRenderMethod(priority, method, options) {

        options = Renderer.#registerRenderMethod_defaultOptions(options);
    
        while(priority in Renderer.#renderMethodPriorities) {
            priority = priority + 1;
        }
        options.method = method;
        Renderer.#renderMethodPriorities[priority] = options;
    
        Renderer.#reprioritizeRendering();
    
        return options.id;
    }

    static #registerRenderMethod_defaultOptions = function(options) {
    
        if(options == null) options = {};
        if (!options.layer) options.layer = "main";
        if(!options.frameLimit) options.frameLimit = -1;
        options.id = generateId(6);
    
        return options;
    }

    static #reprioritizeRendering = function() {
    
        Renderer._renderMethods = [];
        for(var priorityIndex in Renderer.#renderMethodPriorities) {
            Renderer._renderMethods.push(Renderer.#renderMethodPriorities[priorityIndex]);
        }
    }
}