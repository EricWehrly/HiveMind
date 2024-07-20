import HiveMindCharacter from "./HiveMindCharacter";
import '../purposes/growth-purposes';
import { Growable } from "./mixins/Growable";

export interface GrowerConfig {
    batchSize?: number;
    subject?: GrowthCharacter;
    max?: number;
    interval?: number;
}

export default class GrowthCharacter extends HiveMindCharacter {

    growing: (HiveMindCharacter & Growable)[] = [];
    growerConfig: GrowerConfig = {};

    lastSpawn: number;
}
