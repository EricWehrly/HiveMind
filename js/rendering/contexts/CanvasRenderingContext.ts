import Rectangle from "../../baseTypes/rectangle";
import RenderContext from "../RenderContext";

export default class CanvasRenderingContext extends RenderContext {

    private _canvasElement: HTMLCanvasElement;
    private _context: CanvasRenderingContext2D;

    get context() { return this._context; }

    constructor() {
        super();

        this._canvasElement = document.createElement('canvas');
        document.body.appendChild(this._canvasElement);
        this._context = this._canvasElement.getContext('2d');
    }

    Render(screenRect: Rectangle, renderMethods: Function[]): void {
        for(var index in renderMethods) {
            var renderMethod = renderMethods[index];
            try {
                renderMethod(screenRect, this._context);
            } catch(ex) {
                console.error(ex);
            }
        }
    }
}

// we can statically define (probably IN static methods, rather than the file)
// various alternative canvas renderers, especially for things like "offscreen" that are tools for the main
