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

new Technology({
    name: "claws",
    type: Technology.Types.ATTACK,
    range: 3,
    damage: 3,
    delay: 4200
});

new Technology({
    name: "poison",
    type: Technology.Types.ATTACK_MODIFIER,
    damage: 1,
    damageInterval: 2000
});

// projectile

// thorns

// shell
