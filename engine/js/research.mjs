import Listed from './baseTypes/listed.mjs';
import Menu from './ui/menu.mjs';
import UIElement from './ui/ui-element.mjs';
import KeyboardController from '../../js/controls/keyboard-controller.mjs';
import Events from './events.mjs';

Events.List.ResearchEnabled = "ResearchEnabled";

export default class Research extends Listed {

    static DoResearch(context) {
        console.log(context);
    }

    static {

        // we shouldn't have to do this but there's a whole ugly call stack down to UIElement if we don't
        Events.Subscribe(Events.List.GameStart, function() {
            const UI_MENU_RESEARCH = new Menu({
                screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
                name: "Research",
                visible: false,
                menuAction: Research.DoResearch
            });

            UI_MENU_RESEARCH.addItem({name: "Tacos"});

            KeyboardController.AddDefaultBinding("openMenu/research", "r");
        });

    }

    #enabled = false;

    get enabled() {
        return this.#enabled;
    }

    set enabled(value) {

        if(value == true) this.#enabled = true;
        Events.RaiseEvent(Events.List.ResearchEnabled, this);
    }

    constructor(options) {
        super(options);
    }
}

if(window) window.Research = Research;
