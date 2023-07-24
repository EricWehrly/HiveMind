import Character from "../../engine/js/entities/character.mjs";
import CharacterType from "./characterType.mjs";

const Purposes =
{
    "study": {
        name: "Study",
        think: function (character, elapsed) {
            if (character.target) {
                character.pointAtTarget();

                if (character.position.equals(character.target.position)) {
                    if(character.target.dead == true) {
                        // TODO: contemplate
                        // TODO: support > 1 technology
                        if(character.target.technologies && character.target.technologies.length > 0) {
                            character.AddTechnology(character.target.technologies[0]);
                        }
                        if(character.target.characterType) {
                            CharacterType[character.target.characterType].isStudied = true;
                        }
                        character.target = null;
                        character.SetCurrentPurpose("return");
                    } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                }
            }
        }
    },
    "consume": {
        name: "consume",
        think: function (character, elapsed) {
            if (character.target) {
                character.pointAtTarget();

                if (character.position.equals(character.target.position)) {
                    if(character.target.dead == true) {
                        character.target = null;
                        character.SetCurrentPurpose("return");
                    } else {
                        const damageToDo = (character.damage || 1) * (elapsed / 1000);
                        character.target.health -= damageToDo;
                        // TODO: If more than remaining health, add that instead
                        character.health += damageToDo;
                    }
                }
            }
        }
    },
    "hunt": {
        name: "hunt",
        think: function () {

        }
    },
    "return": {
        // do not show this one in menus!
        name: "return",
        think: function (character, elapsed) {

            if (!character.target) character.target = character.parent;
            character.pointAtTarget();
            
            // TODO: if collision boxes overlap ..
            if (character.position.equals(character.target.position)) {
                character.Reabsorb();
            }
        }
    },
    // this thing is supposed to be growing something
    "grow": {
        name: "grow",
        think: function (character, elapsed) {

            // grow fruits near the object, by the amount elapsed

            // TODO: get from character config ...
            const growConfig = {
                subject: CharacterType.Food,
                max: 8, // once 8 are grown, don't start any more
                batchSize: 4,   // grow 4 at a time
                interval: 10000 // how long does it take to fully grow 1 food?
                // size? size increment?
            };

            if(!character.growing) character.growing = [];
            if(character.growing.length < growConfig.max) {
                // TODO: check if we have some to grow that are not yet fully grown
                // const newGrow = new Food();
                // ok so we need to have it be a portion ...
                console.log("Grow new");
                const newGrow = new Character(growConfig.subject);
                newGrow.growth = 0;
                // TODO: random scatter
                newGrow.position = character.position;
                character.growing.push(newGrow);
            }

            character.growing.forEach(growing => {
                // max is 40?
                // (swap 100 to be 40)
                // because 40 was gridsize?
                if(growing.growth < 100) {
                    growing.growth += (100 / growConfig.interval) * elapsed;
                    // update the visual
                    growing.health = growing.growth / 100 * 40;
                }
            });
            
            // get the things we're growing "from" the character
            // create new ones if the list is empty
            // TODO: need to remove assigned food once it's eaten
        }
    }
};

export default Purposes;
