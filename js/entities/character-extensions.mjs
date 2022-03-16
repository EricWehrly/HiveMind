import Character from '../../engine/js/entities/character.mjs';
import { GetColorAsRGBA } from '../../engine/js/util/javascript-extensions.js';
import Purposes from './character-purposes.mjs';

Character.Purposes = Purposes;

const ogThink = Character.prototype.think;
Character.prototype.think = function () {
    // need to check if this properly maps character to 'this'
    ogThink();

    if (this._currentPurposeKey) {
        // Character.Purposes[this._currentPurposeKey].think.bind(this);
        Character.Purposes[this._currentPurposeKey].think(this);
    }
}

// How to add to constructor?
Character.prototype._currentPurposeKey = null;
Character.prototype.SetCurrentPurpose = function (newPurpose) {

    if (typeof newPurpose == "integer") this._currentPurposeKey = newPurpose;
    // else warn
}
Object.defineProperty(Character.prototype, 'purpose', {
    get: function () { return Character.Purposes[this._currentPurposeKey]; }
});

// TODO: set character current subdivision task/purpose
Character.prototype.Subdivide = function (options = {}) {

    const amount = options.amount || 10;
    let purpose;
    if (options.purposeKey) purpose = Character.Purposes[options.purposeKey];
    else if (options.purpose) purpose = options.purpose;
    // else if not in that array ...
    else purpose = Character.Purposes[this._currentPurposeKey];

    if (this.health < amount * 2) {
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
        _currentPurposeKey: purpose.name.toLowerCase()
    });
    spawnedCharacter.parent = this;
    if (options.target) spawnedCharacter.target = options.target;
    spawnedCharacter.graphic.innerHTML = spawnedCharacter.purpose.name;
    console.log(`Subdivided new character for ${spawnedCharacter.purpose.name}`);
}

export default Character;