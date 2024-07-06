import Resource from "../../../engine/js/entities/resource.mjs";
import HiveMindCharacter from "./HiveMindCharacter";
import '../purposes/growth-purposes';

interface GrowConfig {
    interval: number;
    batchSize?: number;
    subject?: GrowthCharacter;
    max?: number;
}

export default class GrowthCharacter extends HiveMindCharacter {

    growth: number = null;
    growConfig: GrowConfig = null;
    growing: GrowthCharacter[] = [];

    lastSpawn: number;

    get isGrown() {

        if(this.growth == undefined || this.growth == null) return true;
        if(this.growth >= 100) return true;
        return false;
    }

    get toolTipMessage() {

        if(!this.isGrown) {
            return super.toolTipMessage + "Growing";
        }

        return super.toolTipMessage;
    }

    constructor(options: any) {
        super(options);

        this.growConfig = options.growConfig || {};
    }

    canBeEaten(byWhom: HiveMindCharacter) {

        if(!super.canBeEaten(byWhom)) return false;

        if(!this.isGrown) return false;

        return true;
    }

    canBeStudied(byWhom: HiveMindCharacter) {
        return super.canBeStudied(byWhom) && this.isGrown;
    }

    think(elapsed: number = 0) {
        super.think(elapsed);

        if (this.growth != null && this.growth < 100) {
            this.#grow(elapsed);
        }
    }

    // assert type integer?
    // Realistically I think the problem is that "growConfig" is currently being used
    // for both growing self as well as growing a target
    // why did we do it like that?
    grow(interval: number) {
        this.growth = 0;
        // TODO: I hate this.
        this.health = .0001;
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

        if(this.growth == null) return;

        const food = Resource.Get("food");
        const growthAmount = ((100 / this.growConfig.interval) * elapsed)
            .clamp(0, 100 - this.growth);
        if (food.pay(growthAmount / 2, this)) {
            this.growth += growthAmount;
            const growthIncrement = growthAmount / 100;
            const healAmount = growthIncrement * this.maxHealth
            this.health += healAmount;

            if(this.isGrown) {
                // console.log(`Done growing ${this.name}`);
                this.growth = null;

                // @ts-ignore
                const characterType = this.characterType;
                this.growConfig = characterType.growConfig;
                if (this.name != characterType.name) {
                    this.name = characterType.name;
                    this.growConfig = characterType.growConfig;
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
