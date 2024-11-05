import Menu from "../../ui/menu";
import UIElement from "../../ui/ui-element";
import { AddCustomInitializer, GetDomForUIElement, GetUIElementFromDom } from "./ui-element-renderer";

function initialRender(uiElemenet: UIElement) {

    const menu = uiElemenet as Menu;
    const htmlElement = GetDomForUIElement(uiElemenet);

    if(menu.canBeClosed) {
        const closeButton = document.createElement("span");
        closeButton.className = "ui close";
        closeButton.innerHTML = "X";
        closeButton.addEventListener("click", menu.close.bind(menu), false);
        htmlElement.appendChild(closeButton);
    }
}

AddCustomInitializer("Menu", initialRender);
