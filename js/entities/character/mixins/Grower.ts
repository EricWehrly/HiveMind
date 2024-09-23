import Entity, { EntityEvent } from "../../../../engine/js/entities/character/Entity";
import Events from "../../../../engine/js/events";
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

        constructor(...args: any) {
            super(...args);

            Events.Subscribe(Events.List.CharacterDied, this.onEntityDied);
        }

        // maybe "growing" should be made generic as "children" ...
        // TODO: deadguy should be grower tho and love monica and bean
        // I think we need to unit test this
        onEntityDied(event: EntityEvent) {
            const deadGuy = event.entity as HiveMindCharacter & Growable;
            for (var char of Entity.List) {
                const character = char as HiveMindCharacter & Grower;
                const index = character?.growing?.indexOf(deadGuy);
                if (index > -1) character.growing.splice(index, 1);
            }
        }
    }
}
