import Rectangle from "../baseTypes/rectangle";
import Renderer from "./renderer";

export interface RenderContextInterface {
    name: string;
    // RegisterRenderMethod(priority: number, method: Function, options?: RenderMethodConstructorOptions): void;
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
}
