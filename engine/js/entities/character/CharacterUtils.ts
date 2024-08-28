import { TechnologyTypes } from "../../TechnologyTypes";
import Point from "../../coordinates/point";
import Character from "../character";
import { EquippedTechnology } from "../equipment";
import Entity from "./Entity";
import { Equipped } from "./mixins/Equipped";
import Playable from "./mixins/Playable";

function GetLocalPlayer(): Entity {
    return Playable.LocalPlayer;
}

function IsLocalPlayer(player: Entity): boolean {
    return player == GetLocalPlayer();
}

// TODO: Would love a limited integration test for this
function GetPlayerEquippedAttack(player?: Character): EquippedTechnology {
    if(!player) player = GetLocalPlayer() as Character;
    const equippedCharacter = player as Character & Equipped;
    const equipped = equippedCharacter.getEquipped(TechnologyTypes.ATTACK);
    return equipped;
}

function GetDistanceToPlayer(point: Readonly<Point>, player?: Character): number {
    if(!player) player = GetLocalPlayer() as Character;
    return point.distance(player.position);
}

export const CharacterUtils = {
    GetPlayerEquippedAttack,
    GetDistanceToPlayer,
    GetLocalPlayer,
    IsLocalPlayer
};
