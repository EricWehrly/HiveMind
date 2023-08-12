import Technology from "../../engine/js/technology.mjs";

// these, at least, are easy to load from json ... until we maybe attach script ...
new Technology({
    name: "slap",
    type: Technology.Types.ATTACK,
    range: 2,
    damage: 10,
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

// on second thought, no poison yet
/*
new Technology({
    name: "poison",
    type: Technology.Types.ATTACK_MODIFIER,
    damage: 1,
    damageInterval: 2000
});
*/

new Technology({
    name: "projectile",
    type: Technology.Types.ATTACK,
    range: 10,
    damage: 1,
    delay: 4200 // can we make it take longer based on how far away?
});

// club (has knockback)

// we probably want to implement a "status effect" class
// to deal with bleed, poison, and knockback

// thorns

// shell
