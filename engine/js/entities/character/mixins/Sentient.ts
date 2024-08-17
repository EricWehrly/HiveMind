import AI from "../../../ai/basic";
import Events from "../../../events";
import Entity from "../Entity";

Events.List.PlayerChunkChanged = "PlayerChunkChanged";
Events.List.PlayerMoved = "PlayerMoved";

export interface Sentient {
    ai: AI;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeSentient<T extends Constructor<Entity>>(Base: T, options: any) {
    return class extends Base implements Sentient {
        private _ai: AI;
        get ai() { return this._ai; }
    }
}
