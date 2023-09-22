// time for some hacky nonsense

import MessageLog from "../../engine/js/core/messageLog.mjs";
import { RegisterLoopMethod } from "../../engine/js/loop.mjs";
import UIElement from "../../engine/js/ui/ui-element.mjs";
import Menu from "../../engine/js/ui/menu.mjs";

const UI_MENU_COMABT_LOG = new Menu({
    screenZone: UIElement.SCREEN_ZONE.BOTTOM_LEFT,
    name: "Combat Log",
    visible: true,
    vertical: true
});
UI_MENU_COMABT_LOG.Element.id = "CombatLog";

function updateCombatLog() {

    const combatLog = MessageLog.Get("Combat");
    const menuItems = combatLog.logs.map(x => x.menuItem)

    for (var menuItem of UI_MENU_COMABT_LOG.items) {

        if(!menuItems.includes(menuItem)) {
            UI_MENU_COMABT_LOG.removeItem(menuItem);
        }
    }

    if(UI_MENU_COMABT_LOG.visible == false) return;

    for (var log of combatLog.logs) {
        if (!log.menuItem) {
            log.menuItem = UI_MENU_COMABT_LOG.addItem({
                name: log.message
            });
        }
    }
}

RegisterLoopMethod(updateCombatLog, false);
