import StatusEffect from "../../engine/js/status-effect.mjs";
import Technology from "../../engine/js/technology.mjs";

const bleeding = new StatusEffect({
    name: "bleeding",
    damage: 1,
    interval: 1000
});

// these, at least, are easy to load from json ... until we maybe attach script ...
new Technology({
    name: "slap",
    type: Technology.Types.ATTACK,
    range: 10,
    damage: 10,     // this damage is actually supposed to be super low (1), but we wanted to test combat systems
    delay: 3000,
    sound: 'audio/slap.mp3'
});

// bleed?
new Technology({
    name: "claws",
    type: Technology.Types.ATTACK,
    range: 3,
    damage: 3,
    delay: 4200
});

new Technology({
    name: "bite",
    type: Technology.Types.ATTACK,
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
    type: Technology.Types.ATTACK_MODIFIER,
    damage: 1,
    interval: 2000
});
*/

new Technology({
    name: "projectile",
    type: Technology.Types.ATTACK,
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

new Technology({
    name: "thorns",
    type: Technology.Types.BUFF,
    thorns: 1,
    delay: 2200
});

// shell (protective?)
