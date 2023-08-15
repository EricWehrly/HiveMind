let uiContainer = null;
let equippedDisplay = null;

if(uiContainer == null) {
    const containerParent = document.createElement("div");
    containerParent.id = "ui-container-parent";
    document.body.appendChild(containerParent);

    uiContainer = document.createElement("div");
    uiContainer.id = "ui-container";
    containerParent.appendChild(uiContainer);

    equippedDisplay = document.createElement("div");
    equippedDisplay.className = "ui bottom";
    uiContainer.appendChild(equippedDisplay);
}

// import acting weird. do a dumb hack
export default null;


// TODO: Maybe in 'player' file, or 'ui' file, draw equipment screen
// listen for equipped events to change equipment
// listen for attack events to show cooldown on attack