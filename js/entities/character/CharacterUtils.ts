import { TechnologyTypes } from "../../TechnologyTypes";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
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

function GetDistanceToPlayer(point: WorldCoordinate, player?: Character): number {
    if(!player) player = GetLocalPlayer() as Character;
    return point.distance(player.position);
}

function UnMangleMixinArgs(...args: any) {
    
    // TODO: catch potential infinite loop
    while(Array.isArray(args)) {
        if(args.length > 1) console.warn(`That's too many options!`);
        args = args[0];
    }
    return args;
}

export const CharacterUtils = {
    GetPlayerEquippedAttack,
    GetDistanceToPlayer,
    GetLocalPlayer,
    IsLocalPlayer,
    UnMangleMixinArgs
};
