import Game from "../../engine/js/main";
import Character from "../../engine/js/entities/character";
import Events from "../../engine/js/events";
import UIElement, { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import { GetDomForUIElement } from "../../engine/js/rendering/ui/ui-element-renderer";

// eventually this should problably translate into an adaptation 
// of Engine-level Objective definitions
// but that's arguably more than we need right now

// TODO: separate game logic from ui logic
let playerHasWon = false;

const UI_ELEMENT_PROGRESS = new UIElement({
    screenZone: SCREEN_ZONE.TOP_CENTER,
    text: "Planetary Takeover Progress",
    classes: ["planetary-takeover-progress"]
});

Events.Subscribe(Events.List.BuildingBuilt, function onBuildingBuilt() {

    if(playerHasWon) return;

    const buildings = Character.get({
        isBuilding: true
    });
    // do we want to do more than just 1 building = 1 point?
    const progress = (buildings.length / Game.GameMap.size) * 100;
    // communicate more concisely to the player
    UI_ELEMENT_PROGRESS.setText(`Planetary Takeover Progress: ${progress.toFixed(2)}%`);

    // TODO: CSS var for player color    
    // this pulls in the ui layer that we need to separate out
    const element = GetDomForUIElement(UI_ELEMENT_PROGRESS);
    element.style.backgroundImage = 
         `linear-gradient(90deg, blue ${progress}%,transparent ${progress * 1.1}%)`;

    if(progress >= 100) {
        alert("You win!");
        // TODO: unsubscribe event (instead of using variable)
        playerHasWon = true;
    }
});
