const Purposes =
{
    "study": {
        name: "Study",
        think: function (character, elapsed) {
            if (character.target) {
                character.moveToTarget();

                if (character.position.equals(character.target.position)) {
                    if(character.target.dead == true) {
                        console.log(`Studied it to death?`);
                        character.target = null;
                        // contemplate
                        // award technology
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
        think: function () {
            // return to player & be reabsorbed
        }
    }
};

export default Purposes;
