import Rectangle from "../../baseTypes/rectangle";
import RenderContext from "../RenderContext";

export default class DomRenderingContext extends RenderContext {

    private _domRoot: HTMLElement;

    constructor() {
        super();

        console.error('TODO: set up dom root: playfield');
    }

    Render(screenRect: Rectangle, renderMethods: Function[]): void {
        for(var index in renderMethods) {
            var renderMethod = renderMethods[index];
            try {
                renderMethod(screenRect, this._domRoot);
            } catch(ex) {
                console.error(ex);
            }
        }
    }
}
