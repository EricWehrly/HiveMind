import Entity from "../../../../engine/js/entities/character/Entity";
import HiveMindCharacter from "../HiveMindCharacter";
import { Growable } from "./Growable";

export interface GrowerConfig {
    batchSize?: number;
    subject?: Entity & Growable;
    max?: number;
    interval?: number;
}

export interface Grower {
    growing: (HiveMindCharacter & Growable)[];
    lastSpawn: number;
    growerConfig: GrowerConfig;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeGrower<T extends Constructor<HiveMindCharacter>>(Base: T, options: any) {
    return class extends Base implements Grower {
        growing: (HiveMindCharacter & Growable)[] = [];
        lastSpawn: number;
        growerConfig: GrowerConfig = options?.growerConfig || {};
    }
}
