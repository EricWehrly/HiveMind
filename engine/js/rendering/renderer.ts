import Rectangle from "../baseTypes/rectangle";
import Events from "../events";
import { generateId } from "../util/javascript-extensions.mjs";
import { RenderContextInterface } from "./RenderContext";

Events.List.RendererResized = 'RendererResized';

export interface RenderMethodConstructorOptions {
    context: string;
    priority?: number;
    frameLimit?: number;
    layer?: string;
}

interface RenderMethodOptions {
    context: string;
    priority?: number;
    frameLimit: number;
    layer: string;
    method: Function;
    id: string;
}

type PrioritizedRenderMethods = { [key: number]: RenderMethodOptions };

let DEFAULT_RENDERER_NAME = "default";
const INITIAL_DEFAULT_RENDERER = DEFAULT_RENDERER_NAME;

export default class Renderer {

    private static _renderContexts = new Map<string, RenderContextInterface>();
    private static _renderMethods: RenderMethodOptions[] = [];
    private static _contextPrioritizedMethods = new Map<string, Function[]>();
    // private static _renderMethodPriorities: { [key: number]: RenderMethodOptions } = {};

    static Render(screenRect: Rectangle) { 

        for(const [key, context] of Renderer._renderContexts.entries()) {
            // get the prioritized render methods for that context
            const prioritizedMethods = Renderer._contextPrioritizedMethods.get(key);
            // render the context
            context.Render(screenRect, prioritizedMethods);
        }
    }

    // ideally protected
    static RegisterRenderContext(context: RenderContextInterface) {
        
        const name = context.name;
        
        if(Renderer._renderContexts.has(name)) {
            console.warn(`Cannot register existing context ${name} `);
        }
        else Renderer._renderContexts.set(name, context);

        Renderer._assignDefaultContext(context);

        Renderer.PrioritizedRendering(context.name);
    }

    private static _assignDefaultContext = function(context: RenderContextInterface) {
        
        if(DEFAULT_RENDERER_NAME == INITIAL_DEFAULT_RENDERER) {
            DEFAULT_RENDERER_NAME = context.name;
            console.debug(`Default renderer context set to ${DEFAULT_RENDERER_NAME}`);

            for(const method of Renderer._renderMethods) {
                if(method.context === INITIAL_DEFAULT_RENDERER) {
                    method.context = DEFAULT_RENDERER_NAME;
                }
            }
        }
    }

    static RegisterRenderMethod(priority: number, method: Function, options?: RenderMethodConstructorOptions) {

        const methodPriorityOptions = Renderer.#registerRenderMethod_defaultOptions(options);
        methodPriorityOptions.priority = priority;
    
        /*
        while(priority in Renderer._renderMethodPriorities) {
            priority = priority + 1;
        }
        */
        methodPriorityOptions.method = method;
        Renderer._renderMethods.push(methodPriorityOptions);

        if(Renderer._renderContexts.size > 0) { // only do this if we have contexts
            Renderer.PrioritizedRendering(methodPriorityOptions.context);
        }
    
        // Renderer.#reprioritizeRendering();
    
        return methodPriorityOptions.id;
    }

    static #registerRenderMethod_defaultOptions = function(options?: RenderMethodConstructorOptions) {

        // if options.context is null, 
        // if we DO have a context (any context) in _renderContexts
        // then use that context
        // else put a "holding" context
        // and then when we get our first context
        // pull everything out of the "holding" context

        const methodPriorityOptions: RenderMethodOptions = {
            context: options?.context || DEFAULT_RENDERER_NAME,   // TODO: better handling for method registration prior to context
            layer: options?.layer || "main",
            frameLimit: options?.frameLimit || -1,
            id: generateId(6),
            method: function() {}
        };
        if(options?.priority) methodPriorityOptions.priority = options.priority;
    
        return methodPriorityOptions;
    }

    private static PrioritizedRendering = function(context: string): void {

        // get all of the Renderer._renderMethodPriorities for this context
        const prioritizedMethods = Renderer._renderMethods;
        const filtered = prioritizedMethods.filter(method => method.context === context);
        const sorted = filtered.sort((a, b) => a.priority - b.priority);

        const flat = sorted.flat();
        const prioritizedFunctions = flat.map(method => method.method);
        Renderer._contextPrioritizedMethods.set(context, prioritizedFunctions);
    }

    /*
    static #reprioritizeRendering = function() {
    
        Renderer._renderMethods = [];
        for(var priorityIndex in Renderer._renderMethodPriorities) {
            Renderer._renderMethods.push(Renderer._renderMethodPriorities[priorityIndex]);
        }
    }
    */
}

// TODO: if gamestart is called and no contexts have been created, 
// create default ones
