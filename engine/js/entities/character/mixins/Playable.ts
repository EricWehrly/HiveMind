import Events from "../../../events";
import Entity from "../Entity";

export interface Playable {
    isPlayer: boolean;
}

type Constructor<T = {}> = new (...args: any[]) => T;

let _LOCAL_PLAYER: Entity & Playable;

export function MakePlayable<T extends Constructor<Entity>>(Base: T, options: any) {
    return class extends Base implements Playable {
    
        static get LOCAL_PLAYER() {
            return _LOCAL_PLAYER;
        }
    
        static set LOCAL_PLAYER(value) {
            _LOCAL_PLAYER = value;
        }

        isPlayer: boolean;
    }
}
