// the seed is a random value
// Like Math.random(seed)

// other stuff will need to reference it ...

// https://stackoverflow.com/a/19303725/5450892
export default class Seed {

    #seed;

    constructor(seed) {

        this.#seed = seed;
    }
    
    Random(min, max) {

        // TODO: the 'if' should be 'isNumeric'?
        if(min != null && max != null) {
            
            return (Math.random() * max) + min;
        } else {

            var x = Math.sin(this.#seed++) * 10000;
            return x - Math.floor(x);
        }
    }
}