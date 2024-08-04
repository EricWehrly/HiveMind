import Equipment from "../../equipment";
import Entity from "../Entity";

export interface Combative {
    equipment: Equipment;
    target: Entity;
    aggression: number;
    aggressionRange: number;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export function MakeCombative<T extends Constructor<Entity>>(Base: T, options: any) {
    return class extends Base implements Combative {
        aggression: number;
        aggressionRange: number;
        equipment: Equipment;
        target: Entity;
    }
}
