import Character from "../../engine/js/entities/character";
import { Combatant } from "../../engine/js/entities/character/Combatant";
import Entity from "../../engine/js/entities/character/Entity.js";
import { Living, MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import Resource from "../../engine/js/entities/resource";
import Menu from "../../engine/js/ui/menu";
import CharacterType from "../entities/CharacterType";
import Building from "../entities/building";
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

        const localPlayer = Character.LOCAL_PLAYER as Combatant;
        
        localPlayer.AddTechnology("thorns");
        
        localPlayer.AddTechnology("claws");

        const buildMenu = Menu.Get("build");
        const seeder = buildMenu.addItem(CharacterType.List['Seeder']);
        seeder.Element.innerHTML = `Desire ${CharacterType.List['Seeder'].name}`;
        const eater = buildMenu.addItem(CharacterType.List['Eater']);
        eater.Element.innerHTML = `Desire ${CharacterType.List['Eater'].name}`;

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
