import Entity from "../../../engine/js/entities/character/Entity";
import { Sentient } from "../../../engine/js/entities/character/mixins/Sentient";
import { Slimey } from "../character/mixins/Slimey";
import CharacterPurpose from "./CharacterPurpose";

    // do not show this one in menus!
new CharacterPurpose({
    name: "Return",
    // TODO: remove the need for "slime" purpose, and purpose needs to be pushed down to 'character'
    think(entity: Entity, elapsed: number) {
        const character = entity as unknown as Sentient & Slimey;
        if (!character.target) {
            character.target = character.parent;
        }
        entity.pointAtTarget(character.parent.position);

        // TODO: if collision boxes overlap ..
        // if(character.targetEntity.area.contains(character.position)) {
        if (entity.position.near(character.parent.position)) {
            character.Reabsorb();
        }        
    }
});
