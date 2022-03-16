const Purposes =
{
    "study": {
        name: "Study",
        think: function (character) {
            if (character.target) {
                character.moveToTarget();

                // if at target ...
                if (character.position.equals(character.target.position)) {
                    console.log("I've arrived!");
                    character.target = null;
                }
                // break down the target
                // contemplate
                // award technology
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
