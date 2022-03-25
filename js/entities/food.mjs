import Character from './character-extensions.mjs';

for (var i = 0; i < 3; i++) {
    // random x and y within some range, on positive axis
    let x = Math.random() * 10;
    let y = Math.random() * 10;
    // spawn food
    new Character({
        color: 'green',
        position: {
            x: x,
            y: y
        },
        ai: null
    });
}