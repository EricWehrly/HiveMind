import Character from "../../engine/js/entities/character";
import Entity from "../../engine/js/entities/character/Entity.js";
import { Equipped } from "../../engine/js/entities/character/mixins/Equipped";
import { Living, MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import Resource from "../../engine/js/entities/resource";
import CharacterType from "../entities/CharacterType";
import Building from "../entities/building";
import { addBuildItem } from "../entities/buildings";
import { MakeHiveMindCharacter } from "../entities/character/HivemindCharacterFactory";
import { MakeGrower } from "../entities/character/mixins/Grower";
import { MakeSlimey } from "../entities/character/mixins/Slimey";

export default class Cheat {
    static get Health(): void {
        const localPlayer = Character.LOCAL_PLAYER as Living;

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

        const localPlayer: Entity & Equipped = Character.LOCAL_PLAYER as unknown as Entity & Equipped;
        
        localPlayer.AddTechnology("thorns");
        
        localPlayer.AddTechnology("claws");

        addBuildItem(CharacterType.List['Seeder']);
        addBuildItem(CharacterType.List['Eater']);

        return null;
    }

    static get Beefcake(): void {

        Cheat.Health;
        Cheat.Food;
        
        const localPlayer = Character.LOCAL_PLAYER;
        localPlayer.speed = 15;

        return null;
    }

    static get Nodes(): void {

        // @ts-expect-error
        const playerFaction = Character.LOCAL_PLAYER.faction;
        const nodeCount = 10;
        const characterType = CharacterType.List['Node'];
        const nodes: Entity[] = [];
        let lastPosition = Character.LOCAL_PLAYER.position;
        for(let i = 0; i < nodeCount; i++) {
            nodes.push(MakeHiveMindCharacter([MakeGrower, MakeLiving, MakeSlimey], {
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
