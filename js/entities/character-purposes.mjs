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
            
            if (character.position.equals(character.target.position)) {
                character.Reabsorb();
            }
        }
    }
};

export default Purposes;
