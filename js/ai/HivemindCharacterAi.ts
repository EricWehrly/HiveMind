import AI from "../../engine/js/ai/basic";
import HiveMindCharacter from "../entities/character/HiveMindCharacter";

export class HiveMindCharacterAI extends AI {

    private get hiveMindCharacter() {
        return this.character as HiveMindCharacter;
    }

    think(elapsed: number = 0) {

        // stupid hack
        let origTarget = null;
        // was this supposed to "save" target entity, or position, or both?
        if(this.hiveMindCharacter.purpose) origTarget = this.targetEntity;

        super.think(elapsed);

        // maybe the purposes should be specific AI implementations instead ...
        if (this.hiveMindCharacter.purpose) {
            if(origTarget) this.targetEntity = origTarget;
            this.hiveMindCharacter.purpose.think(this, elapsed);
        }
    }

}
