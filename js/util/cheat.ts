import Character from "../../engine/js/entities/character";
import { CharacterUtils } from "../../engine/js/entities/character/CharacterUtils";
import Entity from "../../engine/js/entities/character/Entity";
import { EntityOptions } from "../../engine/js/entities/character/EntityOptions";
import { Combative, CombativeOptions, MakeCombative } from "../../engine/js/entities/character/mixins/Combative";
import { Equipped } from "../../engine/js/entities/character/mixins/Equipped";
import { Living, MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import { MakeSentient, SentientOptions } from "../../engine/js/entities/character/mixins/Sentient";
import Resource from "../../engine/js/entities/resource";
import Technology from "../../engine/js/technology";
import NodeAI from "../ai/node";
import CharacterType from "../entities/CharacterType";
import Building from "../entities/building";
import { addBuildItem } from "../entities/buildings";
import { MakeHiveMindCharacter } from "../entities/character/HivemindCharacterFactory";
import { MakeGrower } from "../entities/character/mixins/Grower";
import { MakeSlimey } from "../entities/character/mixins/Slimey";

export default class Cheat {
    static get Health(): void {
        const localPlayer = CharacterUtils.GetLocalPlayer() as Living;

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

        const localPlayer: Entity & Equipped = CharacterUtils.GetLocalPlayer() as unknown as Entity & Equipped;
        
        const thorns = Technology.Get("thorns");
        const claws = Technology.Get("claws");
        localPlayer.AddTechnology(thorns);
        
        localPlayer.AddTechnology(claws);

        addBuildItem(CharacterType.List['Seeder']);
        addBuildItem(CharacterType.List['Eater']);

        return null;
    }

    static get Beefcake(): void {

        Cheat.Health;
        Cheat.Food;
        
        const localPlayer = CharacterUtils.GetLocalPlayer();
        localPlayer.speed = 15;

        return null;
    }

    static get Nodes(): void {

        const localPlayer = (CharacterUtils.GetLocalPlayer() as unknown as Character & Combative);
        const playerFaction = localPlayer.faction;
        const nodeCount = 10;
        const characterType = CharacterType.List['Node'];
        const nodes: Entity[] = [];
        let lastPosition = CharacterUtils.GetLocalPlayer().position;
        const options: EntityOptions & CombativeOptions & SentientOptions = {
            characterType,
            faction: playerFaction,
            ai: NodeAI
        };
        for(let i = 0; i < nodeCount; i++) {
            nodes.push(MakeHiveMindCharacter([MakeGrower, MakeLiving, MakeSlimey, MakeCombative, MakeSentient], options, Building));
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
