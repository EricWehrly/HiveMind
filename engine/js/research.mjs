import Listed from './baseTypes/listed.mjs';
import Menu from './ui/menu.mjs';
import UIElement from './ui/ui-element.mjs';
import KeyboardController from '../../js/controls/keyboard-controller.mjs';
import Events from './events.mjs';
import { Defer } from "./loop.mjs";
import Character from './entities/character.mjs';

Events.List.ResearchEnabled = "ResearchEnabled";
Events.List.ResearchFinished = "ResearchFinished";

export default class Research extends Listed {

    static #UI_MENU_RESEARCH;

    static DoResearch(context) {

        if(context?.menu?.selected?.enabled === false) return;
        const selectedResearch = context?.menu?.selected?.context?.research;
        if(context?.menu?.selected?.Element) {
            context.menu.selected.Element.innerHTML = selectedResearch.name + "<br>Researching...";
        }
        context.menu.selected.enabled = false;
        context.menu.selected.Element.className += " disabled";

        const researchers = Character.get({
            name: "Researcher"
        });
        const researchMultiplier = 1 + (researchers.length / 10);
        const researchCost = selectedResearch.cost / researchMultiplier;

        // TODO: when used, start counting down until the research is done
        // (later that'll make it easier to add visuals)
        Defer(function() {
            if(selectedResearch.callback) selectedResearch.callback();
            context?.menu.removeItem(context.menu.selected);
            Events.RaiseEvent(Events.List.ResearchFinished, this);
            Events.RaiseEvent(`${Events.List.ResearchFinished}-${selectedResearch.name}`, this);
        }, researchCost * 1000);
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
