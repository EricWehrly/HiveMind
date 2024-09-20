// time for some hacky nonsense

import MessageLog, { LoggedMessage } from "../../engine/js/core/MessageLog";
import { SCREEN_ZONE } from "../../engine/js/ui/ui-element";
import Menu from "../../engine/js/ui/menu";
import MenuItem from "../../engine/js/ui/MenuItem";
import Events from "../../engine/js/events";

const UI_MENU_COMABT_LOG = new Menu({
    screenZone: SCREEN_ZONE.BOTTOM_LEFT,
    name: "Combat Log",
    visible: true,
    vertical: true,
    collapsed: true,
    canBeClosed: false
});

const combatLogMenuItems: Record<string, LoggedMessage> = {};

function init() {
    const combatLog = MessageLog.Get("Combat");
    combatLog.onLogsUpdated(updateCombatLog);
}

function updateCombatLog() {

    removeDeletedLogs();

    if (UI_MENU_COMABT_LOG.visible == false) return;

    renderNewLogs();
}

function removeDeletedLogs() {
    const combatLog = MessageLog.Get("Combat");
    const recordedMenuItemIds = Object.keys(combatLogMenuItems);

    for (const menuItemId of recordedMenuItemIds) {
        const log = combatLogMenuItems[menuItemId];
        if (!combatLog.logs.includes(log)) {
            const menuItem = UI_MENU_COMABT_LOG.items.find(item => item.id === menuItemId);
            if (menuItem) {
                UI_MENU_COMABT_LOG.removeItem(menuItem);
                delete combatLogMenuItems[menuItemId];
            }
        }
    }
}

function renderNewLogs() {

    const combatLog = MessageLog.Get("Combat");
    const recordedCombatLogs = Object.values(combatLogMenuItems);

    for (const log of combatLog.logs) {
        if (!recordedCombatLogs.includes(log)) {
            const menuItem = new MenuItem({
                menu: UI_MENU_COMABT_LOG,
                name: log.message
            });
            combatLogMenuItems[menuItem.id] = log;
        }
    }
}

Events.Subscribe(Events.List.GameStart, init);
