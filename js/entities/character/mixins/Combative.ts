import Entity from "../Entity";

export interface Combative {
    target: Entity;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeCombative<T extends Constructor<Entity>>(Base: T, options: any) {
    return class extends Base implements Combative {
        target: Entity;
    }
}
