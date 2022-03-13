import Character from '../../engine/js/entities/character.mjs';
import { GetColorAsRGBA } from '../../engine/js/util/javascript-extensions.js';

// list of subdivsion purposes ...
Character.Purposes = [
    {
        name: "Study",
        think: function() {
            // travel to the target
            // break down the target
            // contemplate
            // award technology
        }
    },
    {
        name: "Consume",
        think: function() {
            
        }
    },
    {
        name: "Hunt",
        think: function() {
            
        }
    }
];

// How to add to constructor?
Character.prototype._currentPurposeIndex = 0;
Character.prototype.SetCurrentPurpose = function(newPurpose) {

    if(typeof newPurpose == "integer") this._currentPurposeIndex = newPurpose;
    // else warn
}
Object.defineProperty(Character.prototype, 'purpose', {
    get: function() { return Character.Purposes[this._currentPurposeIndex]; }
});

// TODO: set character current subdivision task/purpose
Character.prototype.Subdivide = function(options = {}) {

    const amount = options.amount || 10;
    let purpose;
    if(options.purposeIndex) purpose = Character.Purposes[options.purposeIndex];
    else if (options.purpose && Character.Purposes.contains(options.purpose)) purpose = options.purpose;
    // else if not in that array ...
    else purpose = Character.Purposes[this._currentPurposeIndex];

    if(this.health < amount * 2) {
        console.log("Tell the player they can't subdivbide");
        return;
    }

    this.health -= amount;

    let spawnedColor = GetColorAsRGBA(this.color);
    spawnedColor[1] = 25;   // for now ...
    const spawnedCharacter = new Character({
        color: `rgba(${spawnedColor.join(",")})`,
        health: amount,
        position: this.position,
        _currentPurposeIndex: Character.Purposes.indexOf(purpose)
    });
    spawnedCharacter.parent = this;
    if(options.target) spawnedCharacter.target = options.target;
    spawnedCharacter.graphic.innerHTML = spawnedCharacter.purpose.name;
}

export default Character;