import Character from "../../engine/js/entities/character.mjs";
import Resource from "../../engine/js/entities/resource.mjs";
import Technology from "../../engine/js/technology.mjs";
import Menu from "../../engine/js/ui/menu.mjs";
import CharacterType from "../entities/characterType.mjs";

export default class Cheat {
    static get Health() {
        const localPlayer = Character.LOCAL_PLAYER;

        localPlayer.health *= 3;
        localPlayer.maxHealth = localPlayer.health;
    }

    static get Food() {
        Resource.Get("food").value = 1000;
    }

    // alias :shrug:
    static get Gains() {

        Cheat.Health;
    }

    static get Beefcake() {

        Cheat.Health;
        Cheat.Food;
        
        const localPlayer = Character.LOCAL_PLAYER;
        localPlayer.speed = 15;
        
        const thorns = Technology.Get("thorns");
        Character.LOCAL_PLAYER.AddTechnology(thorns);
        
        const claws = Technology.Get("claws");
        Character.LOCAL_PLAYER.AddTechnology(claws);

        const buildMenu = Menu.Get("build");
        const seeder = buildMenu.addItem(CharacterType.Seeder);
        seeder.Element.innerHTML = `Desire ${CharacterType.Seeder.name}`;
        const eater = buildMenu.addItem(CharacterType.Eater);
        eater.Element.innerHTML = `Desire ${CharacterType.Eater.name}`;
    }
}

if(window) window.Cheat = Cheat;
