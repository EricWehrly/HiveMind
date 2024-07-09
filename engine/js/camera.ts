import Renderer from "./rendering/renderer-dom.mjs";
import Events from "./events";
import Entity from "./entities/character/Entity";
import Rectangle from "./baseTypes/rectangle";

// TODO: Global reference somewhere somehow
const GRID_SIZE = 32;
const SCREEN_BORDER_PADDING = 4;

/*
    follow player

    rendering controller or something for other entities
    smooth movement? tweening? speed and accel?
    when player faces a direction, the camera should "shift" in that direction, such that the player is off-center on the screen, with the 'peeked' direction taking some amount
    */

export default class Camera {

    private static _instance: Camera;
    private static _target: Entity;

    static get() {
        return Camera._instance;
    }

    private _screenRect: Rectangle;

    constructor() {
        Camera._instance = this;
        // @ts-ignore
        if(this?.window) window.Camera = this;
        
        Events.Subscribe(Events.List.GameStart, this._renderloop.bind(this));
        Events.Subscribe(Events.List.GameStart, () => {
            // TODO: if the target isn't a player, this won't work right
            // (but that's how things are now, so its ok)
            Events.Subscribe(Events.List.PlayerMoved, this.refreshScreenRect.bind(this));
        });
    }

    // TODO: Trap screen resize
    // pixels
    getViewPortSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }

    // game units
    get screenRect() {
        return this._screenRect;
    }

    private refreshScreenRect() {
        if(Camera._target == null) {
            this._screenRect = null;
        }

        else {
            const viewport = this.getViewPortSize();
            const gridHalfWidth = (viewport.width / 2) / GRID_SIZE;
            const gridHalfHeight = (viewport.height / 2) / GRID_SIZE;
    
            this._screenRect = new Rectangle(
                Camera._target.position.x - gridHalfWidth,
                Camera._target.position.y - gridHalfHeight,
                gridHalfWidth * 2,
                gridHalfHeight * 2
            );
        }
    }

    setTarget(target?: Entity) {
        Camera._target = target;

        this.refreshScreenRect();
    }

    private _renderloop() {
        // we can expand this to encapsulate all renderers, later
        Renderer.Render(this.screenRect);

        window.requestAnimationFrame(this._renderloop.bind(this));
    }
}
