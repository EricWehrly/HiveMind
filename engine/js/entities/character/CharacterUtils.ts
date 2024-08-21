import { TechnologyTypes } from "../../TechnologyTypes";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import Character from "../character";
import { EquippedTechnology } from "../equipment";
import Entity from "./Entity";
import { Equipped } from "./mixins/Equipped";

function GetLocalPlayer(): Entity {
    return Character.LOCAL_PLAYER;
}

function IsLocalPlayer(player: Entity): boolean {
    return player == GetLocalPlayer();
}

// TODO: Would love a limited integration test for this
function GetPlayerEquippedAttack(player?: Character): EquippedTechnology {
    if(!player) player = Character.LOCAL_PLAYER as Character;
    const equippedCharacter = player as Character & Equipped;
    const equipped = equippedCharacter.getEquipped(TechnologyTypes.ATTACK);
    return equipped;
}

function GetDistanceToPlayer(point: WorldCoordinate, player?: Character): number {
    if(!player) player = Character.LOCAL_PLAYER as Character;
    return point.distance(player.position);
}

export const CharacterUtils = {
    GetPlayerEquippedAttack,
    GetDistanceToPlayer,
    GetLocalPlayer,
    IsLocalPlayer
};
