import Menu from "../../ui/menu";
import UIElement from "../../ui/ui-element";
import { CUSTOM_INITIALIZERS, GetDomForUIElement, GetUIElementFromDom } from "./ui-element-renderer";

function toggleCollapsed() {
    const menu = GetUIElementFromDom(this) as Menu;
    menu.toggleCollapsed();
}

function initialRender(uiElemenet: UIElement) {

    const menu = uiElemenet as Menu;

    if(menu.collapsible) {
        // TODO: Handle input situations without mouse
        const collapseHandle = document.createElement("span");
        collapseHandle.className = "collapse-handler";
        const htmlElement = GetDomForUIElement(uiElemenet);
        htmlElement.appendChild(collapseHandle);
        htmlElement.addEventListener("click", toggleCollapsed, false);
    }
}

CUSTOM_INITIALIZERS.set("Menu", initialRender);
