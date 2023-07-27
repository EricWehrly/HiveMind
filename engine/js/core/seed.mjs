// the seed is a random value
// Like Math.random(seed)

// other stuff will need to reference it ...

// https://stackoverflow.com/a/19303725/5450892
export default function Seed(seed) {
    
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}