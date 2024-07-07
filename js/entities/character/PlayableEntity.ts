import SentientLivingEntity from "./SentientLivingEntity";

// this starts getting into the territory of wanting to compose rather than extend ...
export default class PlayableEntity extends SentientLivingEntity {

    // maybe we can find a way around this (better than how we do in game.js)
    // but for now hack in some dumb reference stuff
    private static _LOCAL_PLAYER: PlayableEntity;

    static get LOCAL_PLAYER() {
        return PlayableEntity._LOCAL_PLAYER;
    }

    static set LOCAL_PLAYER(value) {
        PlayableEntity._LOCAL_PLAYER = value;
    }
}
