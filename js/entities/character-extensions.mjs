import Character from '../../engine/js/entities/character.mjs';

// list of subdivsion purposes ...
Character.Purposes = [
    {
        name: "Study"
    },
    {
        name: "Consume"
    },
    {
        name: "Hunt"
    }
];

// How to add to constructor?
Character.prototype._currentPurposeIndex = 0;
Character.prototype.SetCurrentPurpose = function(newPurpose) {

    if(typeof newPurpose == "integer") this._currentPurposeIndex = newPurpose;
    // else warn
}

// TODO: set character current subdivision task/purpose
Character.prototype.Subdivide = function(options = {}) {

    console.log(this);
    console.log(this.health);
    console.log("amount, purpose");

    const amount = options.amount || 10;
    let purpose;
    if(options.purposeIndex) purpose = Character.Purposes[options.purposeIndex];
    else if (options.purpose && Character.Purposes.contains(options.purpose)) purpose = options.purpose;
    // else if not in that array ...
    else purpose = Character.Purposes[this._currentPurposeIndex];
}

export default Character;