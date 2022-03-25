const Purposes =
{
    "study": {
        name: "Study",
        think: function (character, elapsed) {
            if (character.target) {
                character.pointAtTarget();

                if (character.position.equals(character.target.position)) {
                    if(character.target.dead == true) {
                        console.log(`Studied it to death?`);
                        // TODO: contemplate
                        character.AddTechnology(character.target.technologies[0]);
                        character.target = null;
                        character.SetCurrentPurpose("return");
                    } else character.target.health -= (character.damage || 1) * (elapsed / 1000);
                }
            }
            // else return
        }
    },
    "consume": {
        name: "consume",
        think: function () {

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
