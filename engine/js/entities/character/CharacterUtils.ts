import { TechnologyTypes } from "../../TechnologyTypes";
import Character from "../character";
import { EquippedTechnology } from "../equipment";
import { Equipped } from "./mixins/Equipped";

// TODO: Would love a limited integration test for this
export function GetPlayerEquippedAttack(player?: Character): EquippedTechnology {
    if(!player) player = Character.LOCAL_PLAYER as Character;
    const equippedCharacter = player as Character & Equipped;
    const equipped = equippedCharacter.getEquipped(TechnologyTypes.ATTACK);
    return equipped;
}