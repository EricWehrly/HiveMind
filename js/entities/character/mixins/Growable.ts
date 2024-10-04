import { CharacterFilterOptions, EntityOptions } from "../../../../engine/js/entities/character/Entity";
import { Living } from "../../../../engine/js/entities/character/mixins/Living";
import { IsSentient, Sentient } from "../../../../engine/js/entities/character/mixins/Sentient";
import Resource from "../../../../engine/js/entities/resource";
import PostConstruct from "../../../../engine/ts/decorators/PostConstruct";
import HiveMindCharacter from "../HiveMindCharacter";

// TODO: I'm not sure we wanted this exported from here ...
export interface GrowableConfig {
    interval: number;
}

export interface Growable {
    growth: number;
    growConfig: GrowableConfig;
    isGrown: boolean;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeGrowable<T extends Constructor<HiveMindCharacter>>(Base: T, options: any) {
    return class GrowableClass extends Base implements Growable {

        static {
            PostConstruct(GrowableClass, [GrowableClass.prototype.postConstruct]);
        }

        growth: number = null;
        growConfig: GrowableConfig = options?.growConfig || {};

        get isGrown() {

            if (this.growth == undefined || this.growth == null) return true;
            if (this.growth >= 100) return true;
            return false;
        }

        get toolTipMessage() {

            if (!this.isGrown) {
                return super.toolTipMessage + "Growing";
            }

            return super.toolTipMessage;
        }

        constructor(...args: any) {
            super(...args);

            const [options]: (EntityOptions & GrowableConfig)[] = args;
            
            this.growth = 0;
            // TODO: I hate this. (have the character start at as close to 0 health as we dare)
            (this as Living).health = .0001;
            // growConfig is being overwritten here
            this.growConfig = {
                interval: options.interval
            };
        }

        postConstruct(): void {
            if(IsSentient(this)) {
                const sentient = this as Sentient;
                sentient.ai.RegisterThinkMethod(this.onThink_Growable.bind(this));
            }
        }

        // TODO: unit test this
        // make sure the super is called first, then this, with expected results
        canBeEaten(byWhom: HiveMindCharacter) {

            if (!super.canBeEaten(byWhom)) return false;

            if (!this.isGrown) return false;

            return true;
        }

        canBeStudied(byWhom: HiveMindCharacter) {
            return super.canBeStudied(byWhom)
                && this.isGrown;
        }

        private onThink_Growable(elapsed: number = 0) {
            if (this.growth != null && this.growth < 100) {
                this.#grow(elapsed);
            }
        }

        #grow(elapsed: number) {

            if (this.growth == null) return;

            const food = Resource.Get("food");
            const growthAmount = ((100 / this.growConfig.interval) * elapsed)
                .clamp(0, 100 - this.growth);
            if (food.pay(growthAmount / 2, this)) {
                this.growth += growthAmount;
                const growthIncrement = growthAmount / 100;
                const maxHealth = (this as Living).maxHealth;
                const healAmount = growthIncrement * maxHealth;
                (this as Living).health += healAmount;

                if (this.isGrown) {
                    // console.log(`Done growing ${this.name}`);
                    this.growth = null;

                    const characterType = this.characterType;
                    this.growConfig = characterType.growerConfig;
                    if (this.name != characterType.name) {
                        // TODO: check that removing the name assignment doesn't break anything
                        // this.name = characterType.name;
                        this.growConfig = characterType.growerConfig;
                        this.currentPurposeKey = characterType.currentPurposeKey;
                        // TODO: this method doesn't seem to exist anymore
                        // this.removeGraphic();
                        // assign ai?
                        // health is correect?
                        console.log(`Finished developing ${this.name}`);

                        // if(this.growConfig?.subject) console.log(this.growConfig.subject);
                    }
                }
            }
        }

        shouldFilterCharacter(character: HiveMindCharacter & Growable, options: CharacterFilterOptions & { grown: boolean}): boolean {            
            if(options.grown != null && character.isGrown != options.grown) {
                return true;
            }

            return super.shouldFilterCharacter(character, options);
        }
    }
};

export function IsGrowable(character: HiveMindCharacter): character is HiveMindCharacter & Growable {
    return (character as HiveMindCharacter & Growable).growth !== undefined;
}
