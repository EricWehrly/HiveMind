import Character from "../engine/js/entities/character.mjs";

export default class Cheat {
    static Health() {
        const localPlayer = Character.LOCAL_PLAYER;

        localPlayer.health *= 3;
    }
}

if(window) window.Cheat = Cheat;
