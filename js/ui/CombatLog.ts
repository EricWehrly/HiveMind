// time for some hacky nonsense

import MessageLog from "../../engine/js/core/messageLog.mjs";
import { RegisterLoopMethod } from "../../engine/js/loop.mjs";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import Menu from "../../engine/js/ui/menu";
import MenuItem from "../../engine/js/ui/MenuItem";

const UI_MENU_COMABT_LOG = new Menu({
    screenZone: SCREEN_ZONE.BOTTOM_LEFT,
    name: "Combat Log",
    visible: true,
    vertical: true,
    collapsed: true,
    canBeClosed: false
});

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
            new MenuItem({
                menu: UI_MENU_COMABT_LOG,
                name: log.message
            });
        }
    }
}

RegisterLoopMethod(updateCombatLog, false);
