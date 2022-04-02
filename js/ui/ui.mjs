import Events from "../../engine/js/events.mjs";

Events.Subscribe(`${Events.List.ActionFired}-attack`, function(details) {

    console.log(details);
});


// TODO: Maybe in 'player' file, or 'ui' file, draw equipment screen
// listen for equipped events to change equipment
// listen for attack events to show cooldown on attack