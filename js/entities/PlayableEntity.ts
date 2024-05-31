import SentientLivingEntity from "./character/SentientLivingEntity";

// this starts getting into the territory of wanting to compose rather than extend ...
export default class PlayableEntity extends SentientLivingEntity {

    // maybe we can find a way around this (better than how we do in game.js)
    // but for now hack in some dumb reference stuff
    static #LOCAL_PLAYER: PlayableEntity;

    static get LOCAL_PLAYER() {
        return PlayableEntity.#LOCAL_PLAYER;
    }

    static set LOCAL_PLAYER(value) {
        PlayableEntity.#LOCAL_PLAYER = value;
    }

    constructor(options: any) {
        super(options);
    }
}