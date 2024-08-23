import Rectangle from "../baseTypes/rectangle";
import Renderer from "./renderer";

/*
the renderer is the thing that coordinates rendering for the program
it handles timing, ordering, and manages and delegates work
RenderContexts are workers spawned to do the work for a given area and set of render methods
... or are render contexts a set of rendering conditions that describe the context?
*/

// should we have a variable for "RenderContextType"? or how do we define parameters?

export interface RenderContextInterface {
    name: string;
    // RegisterRenderMethod: (priority: number, method: Function, options?: RenderMethodConstructorOptions) => void;
    Render(screenRect: Rectangle, renderMethods: Function[]): void;
}

export default abstract class RenderContext implements RenderContextInterface {

    private _name: string;

    get name() { return this._name; }

    constructor() {
        this._name = this.constructor.name;
        Renderer.RegisterRenderContext(this);
    }

    Render(screenRect: Rectangle, renderMethods: Function[]): void {
        throw new Error("Method not implemented.");
    }
    

    // RegisterRenderMethod: (priority: number, method: Function, options?: RenderMethodConstructorOptions) { };
}
