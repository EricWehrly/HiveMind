import Menu from "../../ui/menu";
import UIElement from "../../ui/ui-element";
import { AddCustomInitializer, GetDomForUIElement, GetUIElementFromDom } from "./ui-element-renderer";

function toggleCollapsed() {
    // The "this" here works, but shouldn't
    const menu = GetUIElementFromDom(this) as Menu;
    menu.toggleCollapsed();
}

function initialRender(uiElemenet: UIElement) {

    const menu = uiElemenet as Menu;
    const htmlElement = GetDomForUIElement(uiElemenet);

    if(menu.collapsible) {
        // TODO: Handle input situations without mouse
        const collapseHandle = document.createElement("span");
        collapseHandle.className = "collapse-handler";
        htmlElement.appendChild(collapseHandle);
        htmlElement.addEventListener("click", toggleCollapsed, false);
    }

    if(menu.canBeClosed) {
        const closeButton = document.createElement("span");
        closeButton.className = "ui close";
        closeButton.innerHTML = "X";
        closeButton.addEventListener("click", menu.close.bind(menu), false);
        htmlElement.appendChild(closeButton);
    }
}

AddCustomInitializer("Menu", initialRender);
