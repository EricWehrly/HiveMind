import Character from './character-extensions.mjs';
import Technology from '../../engine/js/technology.mjs';
import Events from '../../engine/js/events.mjs';

Events.Subscribe(Events.List.GameStart, function() {
    
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
});
