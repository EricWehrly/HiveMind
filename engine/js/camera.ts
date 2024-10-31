import Renderer from "./rendering/renderer";
import Events from "./events";
import Entity from "./entities/character/Entity";
import Rectangle from "./baseTypes/rectangle";
import { CARDINAL_DIRECTION } from "./baseTypes/Vector";
import WorldCoordinate from "./coordinates/WorldCoordinate";
import Point from "./coordinates/point";

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
    private _target: Entity;

    static get() {
        return Camera._instance;
    }

    private _screenRect: Rectangle;

    constructor() {
        Camera._instance = this;
        //@ts-expect-error
        if(this?.window) window.Camera = this;
        
        Events.Subscribe(Events.List.GameStart, this._renderloop.bind(this));
        Events.Subscribe(Events.List.GameStart, () => {
            // TODO: if the target isn't a player, this won't work right
            // (but that's how things are now, so its ok)
            Events.Subscribe(Events.List.PlayerMoved, this.refreshScreenRect.bind(this));
        });
        Events.Subscribe(Events.List.RendererResized, this.refreshScreenRect.bind(this));
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

    GameToScreenCoords(gameCoordinate: Readonly<WorldCoordinate>): Point {

        return new Point(
            ((gameCoordinate.x - this.screenRect.x) * GRID_SIZE),
            ((gameCoordinate.y - this.screenRect.y) * GRID_SIZE)
        );
    }

    private refreshScreenRect() {
        const camera = Camera._instance;
        if(camera._target == null) {
            this._screenRect = null;
        }
    
        else {
            const viewport = this.getViewPortSize();
            const gridHalfWidth = (viewport.width / 2) / GRID_SIZE;
            const gridHalfHeight = (viewport.height / 2) / GRID_SIZE;
    
            // offset screenRect based on camera._target.facing
            const facing = camera._target.facing.cardinalDirection;
            let offsetX = 0, offsetY = 0;
            // const offsetValue = 20 / GRID_SIZE; // Convert pixel offset to grid units
            const offsetValue = 0;
    
            switch(facing) {
                case CARDINAL_DIRECTION.North:
                    offsetY -= offsetValue;
                    break;
                case CARDINAL_DIRECTION.South:
                    offsetY += offsetValue;
                    break;
                case CARDINAL_DIRECTION.West:
                    offsetX -= offsetValue;
                    break;
                case CARDINAL_DIRECTION.East:
                    offsetX += offsetValue;
                    break;
            }
    
            this._screenRect = new Rectangle(
                camera._target.position.x - gridHalfWidth + offsetX,
                camera._target.position.y - gridHalfHeight + offsetY,
                gridHalfWidth * 2,
                gridHalfHeight * 2
            );
        }
    }

    setTarget(target?: Entity) {
        const camera = Camera._instance;
        camera._target = target;

        this.refreshScreenRect();
    }

    private _renderloop() {
        // we can expand this to encapsulate all renderers, later
        Renderer.Render(this.screenRect);

        window.requestAnimationFrame(this._renderloop.bind(this));
    }
}
