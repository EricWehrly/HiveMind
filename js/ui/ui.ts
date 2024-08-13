import './combatLog.mjs';
// import './characterInfo.mjs';
import './InputMenu.ts';
import './PauseMenu.ts';

export default class UI { 

    private static _container: HTMLElement = null;

    static get CONTAINER() {
        return UI._container;
    }

    static {            
        const containerParent = document.createElement("div");
        containerParent.id = "ui-container-parent";
        document.body.appendChild(containerParent);

        UI._container = document.createElement("div");
        UI._container.id = "ui-container";
        containerParent.appendChild(UI._container);

        const equippedDisplay = document.createElement("div");
        equippedDisplay.className = "ui bottom";
        UI._container.appendChild(equippedDisplay);
    }
}

// TODO: Maybe in 'player' file, or 'ui' file, draw equipment screen
// listen for equipped events to change equipment
// listen for attack events to show cooldown on attack