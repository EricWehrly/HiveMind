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
