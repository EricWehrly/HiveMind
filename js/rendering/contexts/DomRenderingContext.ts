import Rectangle from "../../baseTypes/rectangle";
import RenderContext from "../RenderContext";
import Renderer, { RenderMethodConstructorOptions } from "../renderer";

type RenderMethod = (screenRect: Rectangle, domRoot: HTMLElement) => void;

export default class DomRenderingContext extends RenderContext {

    private static _domRoot: HTMLElement;

    static {
        DomRenderingContext._domRoot = document.createElement("div")
        DomRenderingContext._domRoot.id = "playfield";
        document.body.appendChild(DomRenderingContext._domRoot);
    }

    static RegisterRenderMethod(priority: number, method: RenderMethod, options?: RenderMethodConstructorOptions): void {
        if(!options) options = {
            context: 'DomRenderingContext'
        };
        else options.context = options?.context || 'DomRenderingContext';
        Renderer.RegisterRenderMethod(priority, method, options);
    }

    constructor() {
        super();
    }

    Render(screenRect: Rectangle, renderMethods: RenderMethod[]): void {

        if(!DomRenderingContext._domRoot) debugger;

        for(var index in renderMethods) {
            var renderMethod = renderMethods[index];
            try {
                renderMethod(screenRect, DomRenderingContext._domRoot);
            } catch(ex) {
                console.error(ex);
            }
        }
    }
}
