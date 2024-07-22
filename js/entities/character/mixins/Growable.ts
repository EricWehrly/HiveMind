import { Living } from "../../../../engine/js/entities/character/mixins/Living";
import Resource from "../../../../engine/js/entities/resource.mjs";
import HiveMindCharacter from "../HiveMindCharacter";

// TODO: I'm not sure we wanted this exported from here ...
export interface GrowableConfig {
    interval?: number;
}

export interface Growable {
    growth: number;
    growConfig: GrowableConfig;
    isGrown: boolean;
    grow(interval: number): void;
}

type Constructor<T = {}> = new (...args: any[]) => T;

// TODO: this options any is going to need to become aligned with HiveMindCharacter ctor when it has types
export function MakeGrowable<T extends Constructor<HiveMindCharacter>>(Base: T, options: any) {
    return class extends Base implements Growable {

        growth: number = null;
        growConfig: GrowableConfig = options.growConfig || {};

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

        think(elapsed: number = 0) {
            super.think(elapsed);

            if (this.growth != null && this.growth < 100) {
                this.#grow(elapsed);
            }
        }

        // Realistically I think the problem is that "growConfig" is currently being used
        // for both growing self as well as growing a target
        grow(interval: number) {
            this.growth = 0;
            // TODO: I hate this.
            (this as Living).health = .0001;
            // growConfig is being overwritten here
            this.growConfig = {
                interval
            };

            // TODO: instrument and console.log Context.Character
            // check if it's "this" or not ...
        }

        // maybe we could expand this to accept a growthconfig
        // as a means to get growing started
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
                        this.name = characterType.name;
                        this.growConfig = characterType.growerConfig;
                        this._currentPurposeKey = characterType._currentPurposeKey;
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
    }
};