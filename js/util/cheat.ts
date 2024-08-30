import Character from "../../engine/js/entities/character";
import Entity from "../../engine/js/entities/character/Entity.js";
import { Combative, MakeCombative } from "../../engine/js/entities/character/mixins/Combative";
import { Equipped } from "../../engine/js/entities/character/mixins/Equipped";
import { Living, MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import Playable from "../../engine/js/entities/character/mixins/Playable";
import Resource from "../../engine/js/entities/resource";
import CharacterType from "../entities/CharacterType";
import Building from "../entities/building";
import { addBuildItem } from "../entities/buildings";
import { MakeHiveMindCharacter } from "../entities/character/HivemindCharacterFactory";
import { MakeGrower } from "../entities/character/mixins/Grower";
import { MakeSlimey } from "../entities/character/mixins/Slimey";

export default class Cheat {
    static get Health(): void {
        const localPlayer = Playable.LocalPlayer as Living;

        localPlayer.health *= 3;
        localPlayer.maxHealth = localPlayer.health;

        return null;
    }

    static get Food(): void {
        Resource.Get("food").value = 1000;

        return null;
    }

    // alias :shrug:
    static get Gains(): void {

        Cheat.Health;

        return null;
    }

    static get Unlocks(): void {

        const localPlayer: Entity & Equipped = Playable.LocalPlayer as unknown as Entity & Equipped;
        
        localPlayer.AddTechnology("thorns");
        
        localPlayer.AddTechnology("claws");

        addBuildItem(CharacterType.List['Seeder']);
        addBuildItem(CharacterType.List['Eater']);

        return null;
    }

    static get Beefcake(): void {

        Cheat.Health;
        Cheat.Food;
        
        const localPlayer = Playable.LocalPlayer;
        localPlayer.speed = 15;

        return null;
    }

    static get Nodes(): void {

        const localPlayer = (Playable.LocalPlayer as unknown as Character & Combative);
        const playerFaction = localPlayer.faction;
        const nodeCount = 10;
        const characterType = CharacterType.List['Node'];
        const nodes: Entity[] = [];
        let lastPosition = Playable.LocalPlayer.position;
        for(let i = 0; i < nodeCount; i++) {
            nodes.push(MakeHiveMindCharacter([MakeGrower, MakeLiving, MakeSlimey, MakeCombative], {
                characterType,
                faction: playerFaction
            }, Building));
            nodes[i].position = {
                x: lastPosition.x + 1,
                y: lastPosition.y + 9
            };
            lastPosition = nodes[i].position;
        }

        return null;
    }
}

if(window) window.Cheat = Cheat;
