import Point from "../../engine/js/baseTypes/point.mjs";
import Events from "../../engine/js/events.mjs";
import HiveMindCharacter from "./character-extensions.mjs";
import CharacterType from "./characterType.mjs";

function randomPositionOffset(source, offsetAmountPerAxis) {
    
    let xOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if(Math.random() < 0.5) xOffset *= -1;
    let yOffset = Math.randomBetween(0, offsetAmountPerAxis);
    if(Math.random() < 0.5) yOffset *= -1;

    return new Point(source.x + xOffset, source.y + yOffset);
}

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
                    // } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                    } else character.target.health = 0; // cheat for make testing easier
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
    "grow": {
        name: "grow",
        think: function (character, elapsed) {

            // TODO: get from character config ...
            const growConfig = {
                subject: CharacterType.Food,
                max: 8, // once 8 are grown, don't start any more
                batchSize: 4,   // grow 4 at a time
                interval: 10000 // how long does it take to fully grow 1 food?
            };

            if(!character.growing) character.growing = [];
                const growing = character.growing.filter(growing => growing.growth < 100);
            if(growing.length < growConfig.batchSize
                && character.growing.length < growConfig.max) {
                const newGrow = new HiveMindCharacter(growConfig.subject);
                newGrow.growth = 0;
                newGrow.position = randomPositionOffset(character.position, 5);
                character.growing.push(newGrow);
            }

            character.growing.forEach(growing => {
                if(growing.growth < 100) {
                    growing.growth += (100 / growConfig.interval) * elapsed;
                    growing.health = (growing.growth / 100) * growing.maxHealth;
                }
                if(growing.growth > 100) growing.growth = 100;
            });

            for(var index = 0; index < character.growing.length; index++) {
                const growing = character.growing[index];

                if (growing.growth == 100) {
                    delete growing.growth;
                }
            }
        }
    }
};

// maybe "growing" should be made generic as "children" ...
Events.Subscribe(Events.List.CharacterDied, (deadGuy) => {
    for(var character of CHARACTER_LIST) {
        const index = character?.growing?.indexOf(deadGuy);
        if(index > -1) character.growing.splice(index, 1);
    }
});

export default Purposes;
