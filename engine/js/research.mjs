import Listed from './baseTypes/listed.mjs';
import Menu from './ui/menu.mjs';
import UIElement from './ui/ui-element.mjs';
import KeyboardController from '../../js/controls/keyboard-controller.mjs';
import Events from './events.mjs';
import { Defer } from "./loop.mjs";

Events.List.ResearchEnabled = "ResearchEnabled";
Events.List.ResearchFinished = "ResearchFinished";

export default class Research extends Listed {

    static #UI_MENU_RESEARCH;

    static DoResearch(context) {

        const selectedResearch = context?.menu?.selected?.context;
        if(context?.menu?.selected?.Element) {
            context.menu.selected.Element.innerHTML = selectedResearch.name + "<br>Researching...";
        }
        // disable the research from being double-tapped

        // TODO: when used, start counting down until the research is done
        // (later that'll make it easier to add visuals)
        Defer(function() {
            if(selectedResearch.callback) selectedResearch.callback();
            context.menu.selected.Element.remove();
            context?.menu.removeItem(selectedResearch.research);
            Events.RaiseEvent(Events.List.ResearchFinished, this);
            Events.RaiseEvent(`${Events.List.ResearchFinished}-${selectedResearch.name}`, this);
        }, selectedResearch.cost * 1000);
    }

    static {

        // we shouldn't have to do this but there's a whole ugly call stack down to UIElement if we don't
        Events.Subscribe(Events.List.GameStart, function () {
            Research.#UI_MENU_RESEARCH = new Menu({
                screenZone: UIElement.SCREEN_ZONE.MIDDLE_RIGHT,
                name: "Research",
                visible: false,
                menuAction: Research.DoResearch
            });

            KeyboardController.AddDefaultBinding("openMenu/research", "r");
        });

    }

    #cost = 0;
    get cost() { return this.#cost; }
    
    #callback = null;
    get callback() { return this.#callback; }

    #enabled = false;
    get enabled() { return this.#enabled; }

    set enabled(value) {

        if (value == true && this.enabled != true) {
            this.#enabled = true;

            Events.RaiseEvent(Events.List.ResearchEnabled, this);

            // TODO: if this is the first enabled, also enable research menu
            // (but not really, for a tech demo. empty research menu is fine)

            Research.#UI_MENU_RESEARCH.addItem({
                name: this.name,
                cost: this.cost,
                // TODO: reference callback from research, rather than assigning it here
                callback: this.callback,
                research: this
            });
        }
    }

    constructor(options) {
        super(options);

        this.#cost = options.cost || 0;
        this.#callback = options.callback;
    }
}

if (window) window.Research = Research;
