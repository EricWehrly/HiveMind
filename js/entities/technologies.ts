import Character from "../../engine/js/entities/character";
import { Combative } from "../../engine/js/entities/character/mixins/Combative";
import PlayableEntity from "../../engine/js/entities/character/PlayableEntity";
import StatusEffect from "../../engine/js/StatusEffect";
import Technology from "../../engine/js/technology";
import { TechnologyTypes } from "../../engine/js/TechnologyTypes";

const bleeding = new StatusEffect({
    name: "bleeding",
    damage: 1,
    interval: 1000
});

// these, at least, are easy to load from json ... until we maybe attach script ...
new Technology({
    name: "slap",
    type: TechnologyTypes.ATTACK,
    range: 10,
    damage: 1,     // this damage is actually supposed to be super low (1), but we wanted to test combat systems
    delay: 2200,
    sound: 'audio/slap.mp3'
});

// bleed?
new Technology({
    name: "claws",
    type: TechnologyTypes.ATTACK,
    range: 3,
    damage: 3,
    delay: 4200
});

new Technology({
    name: "bite",
    type: TechnologyTypes.ATTACK,
    range: 1,
    damage: 3,
    delay: 6000,
    statusEffect: bleeding,
    statusEffectDuration: 3000
});

// on second thought, no poison yet
/*
new Technology({
    name: "poison",
    type: TechnologyTypes.ATTACK_MODIFIER,
    damage: 1,
    interval: 2000
});
*/

new Technology({
    name: "projectile",
    type: TechnologyTypes.ATTACK,
    range: 10,
    damage: 1,
    delay: 4200, // can we make it take longer based on how far away?
    sound: [
        'audio/attacks/projectile/projectile-1.mp3',
        'audio/attacks/projectile/projectile-2.mp3',
        'audio/attacks/projectile/projectile-3.mp3'
    ]
});

// club (has knockback)

// we probably want to implement a "status effect" class
// to deal with bleed, poison, and knockback

function makeThornier() {

    const combativePlayer = Character.LOCAL_PLAYER as PlayableEntity & Combative;

    combativePlayer.thornMultiplier++;
}

new Technology({
    name: "thorns",
    type: TechnologyTypes.BUFF,
    thorns: 1,
    delay: 2200,
    research: {
        cost: 15,
        callback: makeThornier
    }
});

// shell (protective?)
