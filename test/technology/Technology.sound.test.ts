// import mockEvents from "../testHelpers/mockEvents";
import mockMap from "../testHelpers/mockMap";
import { TechnologyTypes } from "../../js/TechnologyTypes";
import Events from "../../js/events";
import { EntityOptions } from "../../js/entities/character/EntityOptions";
import { SentientOptions } from "../../js/entities/character/mixins/Sentient";
import { Equipped, EquippedOptions, MakeEquipped } from "../../js/entities/character/mixins/Equipped";
import { EntityMixin, MakeCharacter } from "../../js/entities/character/CharacterFactory";
import { CharacterAttackEvent, Combative, MakeCombative } from "../../js/entities/character/mixins/Combative";
import Entity from "../../js/entities/character/Entity";

// jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

let localPlayer: Entity = null;
jest.mock('@/engine/js/entities/character/CharacterUtils', () => ({
    CharacterUtils: {
    GetLocalPlayer: () => {
        return localPlayer;
    },
    IsLocalPlayer: (player: Entity) => false
}}));

import Technology from "../../js/technology";

describe('Technology', () => {
    describe('sound', () => {

        afterEach(() => {
            // jest.clearAllMocks();
            jest.restoreAllMocks();
        });
        
        function makeAttacker(distance: number) {

            const tech = new Technology({
                name: 'Test',
                type: TechnologyTypes.ATTACK
            });
            const options: EntityOptions & SentientOptions & EquippedOptions = {
                ai: null,
                name: 'Reference',
                position: {
                    x: distance,
                    y: 0
                },
                technologies: [
                    tech
                ],
                // range: 5
            }
            const attacker = MakeCharacter([MakeEquipped, MakeCombative as EntityMixin], options);
            return attacker;
        }

        function createAttackEvent(distance: number) {
            const attacker = makeAttacker(distance) as Entity & Equipped;
            const attacked = makeAttacker(0) as Entity & Equipped;
            localPlayer = attacked;
            const equipped = attacker.getEquipped(TechnologyTypes.ATTACK);
            const event: CharacterAttackEvent = {
                attacker,
                attacked,
                equipped
            };
            return event;
        }

        it('should play a sound on attack event', () => {
            const event = createAttackEvent(1);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalled();
        });

        it('should be 0 at distance 100', () => {
            const event = createAttackEvent(100);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalledWith({ volume: 0 });
        });

        it('should be 100 at distance 0', () => {
            const event = createAttackEvent(0);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalledWith({ volume: 100 });
        });

        it('should be 70 at distance 30', () => {
            const event = createAttackEvent(30);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalledWith({ volume: 70 });
        });

        it('should be 90 at distance -10', () => {
            const event = createAttackEvent(-10);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalledWith({ volume: 90 });
        });

        it('should be 0 at distance 103', () => {
            const event = createAttackEvent(103);
            const technology = event.equipped.technology;
            const playSoundSpy = jest.spyOn(technology, 'playSound');

            Events.RaiseEvent(Events.List.CharacterAttacking, event);
            expect(playSoundSpy).toHaveBeenCalledWith({ volume: 0 });
        });
    });
});
