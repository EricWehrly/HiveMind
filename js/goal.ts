import Game from "../engine/js/engine.mjs";
import Character from "../engine/js/entities/character";
import Events from "../engine/js/events";
import UIElement from "../engine/js/ui/ui-element.mjs";

// eventually this should problably translate into an adaptation 
// of Engine-level Objective definitions
// but that's arguably more than we need right now

let playerHasWon = false;

const UI_ELEMENT_PROGRESS = new UIElement({
    screenZone: UIElement.SCREEN_ZONE.TOP_CENTER
});
UI_ELEMENT_PROGRESS.Element.id = "objective-progress";
UI_ELEMENT_PROGRESS.Element.innerHTML = "Planetary Takeover Progress";

Events.Subscribe(Events.List.BuildingBuilt, function onBuildingBuilt(building: any) {

    if(playerHasWon) return;

    const buildings = Character.get({
        isBuilding: true
    });
    // do we want to do more than just 1 building = 1 point?
    const progress = (buildings.length / Game.Map.size) * 100;
    // communicate more concisely to the player
    // UI_ELEMENT_PROGRESS.Element.innerHTML = "Planetary Takeover Progress"
        // + `<br> ${buildings.length} / ${map.size} : ${progress}%`;

    // TODO: CSS var for player color
    UI_ELEMENT_PROGRESS.Element.style.backgroundImage = 
        `linear-gradient(90deg, blue ${progress}%,transparent ${progress * 1.1}%)`;

    if(progress >= 100) {
        alert("You win!");
        // TODO: unsubscribe event (instead of using variable)
        playerHasWon = true;
    }
});
