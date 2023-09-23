import Character from "../../engine/js/entities/character.mjs";
import Resource from "../../engine/js/entities/resource.mjs";
import Technology from "../../engine/js/technology.mjs";

export default class Cheat {
    static get Health() {
        const localPlayer = Character.LOCAL_PLAYER;

        localPlayer.health *= 3;
    }

    static get Food() {
        Resource.Get("food").value = 1000;
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
    }
}

if(window) window.Cheat = Cheat;
