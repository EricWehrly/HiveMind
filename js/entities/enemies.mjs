import Character from './character-extensions.mjs';
import Technology from '../../engine/js/technology.mjs';

// TODO: Now we need an "on game start" event
setTimeout(function() {
    
    const claws = Technology.Get("claws");

    new Character({
        color: 'red',
        health: 40,
        position: {
            x: 11,
            y: 11
        },
        technologies: [claws]
    });

}, 2000);
