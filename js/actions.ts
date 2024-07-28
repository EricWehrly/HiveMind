// TODO: Can we figure out a way to import these from 'data' better?

import Purposes from "./entities/purposes/character-purposes";
import Action from "../engine/js/action";
import Technology from "../engine/js/technology";
import Entity from "../engine/js/entities/character/Entity";
import { Slimey } from "./entities/character/mixins/Slimey";

// this should move down to the engine once we ts it
interface ActionOptions {
    character: Entity & Slimey
}

const ActionList = Action.List;

// maybe not allowed to do this at first
new Action({
    name: 'subdivide',
    isCharacterControl: true,
    // TODO: Maybe we should just have "on press" vs "on held" ...
    oncePerPress: true,
    callback: function (options: ActionOptions) {
        options.character.Subdivide({});
    }
})

// TODO: unavailable if a subdivided piece is already studying the target
new Action({
    name: 'study',
    isCharacterControl: true,
    enabled: false,
    oncePerPress: true,
    delay: 1000,
    callback: function (options: ActionOptions) {

        const piece = options.character.Subdivide({
            purpose: Purposes["study"],
            target: ActionList["study"].target
        });
    }
});

// TODO: unavailable if a subdivided piece is already nomming the target
new Action({
    name: 'consume',
    isCharacterControl: true,
    enabled: false,
    oncePerPress: true,
    delay: 250,    // do we even want this? maybe there should be a generic one
    callback: function (options: ActionOptions) {

        // TODO: take this from the player eventually
        const slap = Technology.Get("slap");

        options.character.Subdivide({
            purpose: Purposes["consume"],
            target: ActionList["consume"].target,
            technologies: [slap]
        });
    }
});
