import Rectangle from "../baseTypes/rectangle";
import Events from "../events";
import Renderer from "./renderer";

Events.List.RendererResized = 'RendererResized';

export default class DomRenderer extends Renderer {

    static Render(screenRect: Rectangle) {

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

function onWindowResize() {
    Events.RaiseEvent(Events.List.RendererResized, null);
}

window.addEventListener('resize', onWindowResize);
