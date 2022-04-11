import Renderer from "./renderer.mjs";

export default class DomRenderer extends Renderer {

    static Render(screenRect) {

        for(var index in Renderer._renderMethods) {
            var renderMethodEntry = Renderer._renderMethods[index];
            try {
                // renderMethodEntry.method(Monolith.Renderer._contexts[renderMethodEntry.layer]);
                renderMethodEntry.method(screenRect);
            } catch(ex) {
                console.error(ex);
            }
        }        
    }    
}
