// the seed is a random value
// Like Math.random(seed)

// other stuff will need to reference it ...

// https://stackoverflow.com/a/19303725/5450892
export default class Seed {

    #seed;

    constructor(seed) {

        this.#seed = seed;
    }
    
    // TODO: Multiplayer will make this problematic:
    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript/19303725#comment54541128_19303725
    // but remember though that we intentionally wanted players (clients) doing the generation each, and sharing to the network
    // 'different' could mean variety
    // also, screw it, this is just supposed to be a prototype
    Random(min, max) {

        // TODO: the 'if' should be 'isNumeric'?
        if(min != null && max != null) {
            
            return (this.Random() * max) + min;
        } else {

            var x = Math.sin(this.#seed++) * 10000;
            return x - Math.floor(x);
        }
    }
}