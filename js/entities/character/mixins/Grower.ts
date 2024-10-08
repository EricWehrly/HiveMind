import Point from "../../../../engine/js/coordinates/point";
import WorldCoordinate from "../../../../engine/js/coordinates/WorldCoordinate";
import Entity, { EntityEvent } from "../../../../engine/js/entities/character/Entity";
import { IsSentient, Sentient } from "../../../../engine/js/entities/character/mixins/Sentient";
import Resource from "../../../../engine/js/entities/resource";
import Events from "../../../../engine/js/events";
import PostConstruct from "../../../../engine/ts/decorators/PostConstruct";
import HiveMindCharacter, { HivemindCharacterOptions } from "../HiveMindCharacter";
import { HiveMindCharacterFactory, MakeHiveMindCharacter } from "../HivemindCharacterFactory";
import { Growable, GrowableConfig } from "./Growable";

export interface GrowerConfig extends GrowableConfig {
    batchSize?: number;
    subject?: Entity & Growable;
    max?: number;
    // interval?: number;
}

export interface Grower {
    growing: (HiveMindCharacter & Growable)[];
    lastSpawn: number;
    growerConfig: GrowerConfig;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// this class seems to fundamentally require the character purpose to be 'growth'
// ... but why?
// we need to get rid of options
// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeGrower<T extends Constructor<HiveMindCharacter>>(Base: T, options: any) {
    return class GrowerClass extends Base implements Grower {

        static {
            PostConstruct(GrowerClass, [GrowerClass.prototype.postConstruct]);
        }

        growing: (HiveMindCharacter & Growable)[] = [];
        lastSpawn: number;
        growerConfig: GrowerConfig = options?.growerConfig || {};

        constructor(...args: any) {
            super(...args);

            // if(!options.mixins, assign default)
            this.growerConfig.mixins = options.mixins || HiveMindCharacterFactory.DefaultMixins;

            Events.Subscribe(Events.List.CharacterDied, this.onEntityDied);
        }

        postConstruct(): void {
            if(IsSentient(this)) {
                const sentient = this as Sentient;
                sentient.ai.RegisterThinkMethod(this.onThink_Grower.bind(this));
            }            
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

        private onThink_Grower(elapsed: number) {

            const grower = this as Entity & Grower;
    
            if (!grower.growing) grower.growing = [];
            const growing = grower.growing.filter(growing => growing.growth < 100)
                || [];
            if (growing.length < grower.growerConfig.batchSize
                && grower.growing.length < grower.growerConfig.max) {
    
                const subject = grower.growerConfig.subject;
    
                const food = Resource.Get("food");
                // Building.#FOOD_THRESHOLD ?
                // const characterType = CharacterType.List[];
                if(food.available < subject.characterType.health) {
                    // console.debug(`${food.available} food < ${characterType.health}, can't build ${character.growerConfig.subject.name}`);
                    return;
                }
    
                // TODO: need to instrument range, maybe growConfig.range?
                const position = randomPositionOffset(grower.position, 5)
                // check if we have the food to do this
                // should we wait until we "have had" food for X "cycles"
                // or implement some kind of priority queuing system? ("want to grow")
                const options: HivemindCharacterOptions & GrowableConfig = {
                    characterType: grower.growerConfig.subject.characterType,
                    position,
                    interval: grower.growerConfig.interval,
                    mixins: grower.growerConfig.mixins || HiveMindCharacterFactory.DefaultMixins,
                    ...grower.growerConfig.subject
                };
                // does this really need to be sentient tho?
                const newGrow = MakeHiveMindCharacter(grower.growerConfig.mixins, options) as HiveMindCharacter & Growable;
                if(!food.reserve(subject.characterType.health, newGrow)) {
                    console.warn(`The food was available but isn't now?`);
                    return;
                }
                grower.growing.push(newGrow);
            }     
        }
    }
}

export function IsGrower(character: HiveMindCharacter): character is HiveMindCharacter & Grower {
    return (character as HiveMindCharacter & Grower).growing !== undefined;
}

function randomPositionOffset(source: Readonly<Point>, offsetAmountPerAxis: number) {

    let xOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) xOffset *= -1;
    let yOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if (Math.random() < 0.5) yOffset *= -1;

    return new WorldCoordinate(source.x + xOffset, source.y + yOffset);
}
