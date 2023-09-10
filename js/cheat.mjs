import Character from "../engine/js/entities/character.mjs";
import Resource from "../engine/js/entities/resource.mjs";

export default class Cheat {
    static Health() {
        const localPlayer = Character.LOCAL_PLAYER;

        localPlayer.health *= 3;
    }

    static Food() {
        Resource.Get("food").value = 1000;
    }
}

if(window) window.Cheat = Cheat;
