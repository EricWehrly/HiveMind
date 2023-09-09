import UIElement from "../engine/js/ui/ui-element.mjs";
import Menu from "../engine/js/ui/menu.mjs";
import KeyboardController from "./controls/keyboard-controller.mjs";
import Events from "../engine/js/events.mjs";
import Character from "../engine/js/entities/character.mjs";
import Resource from "../engine/js/entities/resource.mjs";

function characterMenuAction(context) {

    const selected = characterMenu.selected;
    if(selected.context.callback) selected.context.callback();
}

// we actually probably want this to be more of a modal
const characterMenu = new Menu({
    screenZone: UIElement.SCREEN_ZONE.TOP_CENTER,
    name: "Character",
    visible: false,
    menuAction: characterMenuAction
});

const foodLabel = characterMenu.addLabel({
    name: 'Current Food: ??'
});

const makeStronger = function() {
    
    console.log(this);
    // if we can pay the cost
    const food = Resource.Get("food")?.value || 0;
    console.log(food);
    this.cost = Math.log(this.cost);
}

const strongerItem = characterMenu.addItem({
    name: 'Hit Harder',
    cost: 40,
    callback: makeStronger
});

const fasterItem = characterMenu.addItem({
    name: 'Run Faster',
    cost: 40,
    callback: makeStronger
});

function playerHealthChanged(context) {

    // if the menu is open
    // update the menu
    console.log(context);
}

function menuOpened(menu) {

    if(menu == characterMenu) {
        // console.log(menu);

        const localPlayer = Character.LOCAL_PLAYER;
        
        foodLabel.Element.innerHTML = `Current Food: ${localPlayer.health}`;
    }
}

Events.Subscribe(Events.List.PlayerHealthChanged, playerHealthChanged);
Events.Subscribe(Events.List.MenuOpened, menuOpened);

KeyboardController.AddDefaultBinding("openMenu/character", "c");
