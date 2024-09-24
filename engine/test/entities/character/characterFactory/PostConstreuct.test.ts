import mockEvents from "../../../testHelpers/mockEvents";
import mockMap from "../../../testHelpers/mockMap";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";
import { MakePlayable, Playable } from "../../../../js/entities/character/mixins/Playable";
import { SentientOptions } from "../../../../js/entities/character/mixins/Sentient";

// jest.mock('@/engine/js/events', () => mockEvents);

let manuallyTrackedMockCalls: string[] = [];
jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation((eventName) => {
                manuallyTrackedMockCalls.push(eventName);
             }),
            List: new Proxy({}, {
                get: function(target, name) {
                    return name;
                },
                set: function(target, name, value) {
                    return true;  // Indicate that the assignment succeeded
                }
            })
        }
    };
});
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('ChacterFactory.MakeCharacter', () => {

    beforeEach(() => {
        manuallyTrackedMockCalls = [];
    });

    it('should call base postConstruct', () => {

        // TODO: So we couldn't get the spy to work properly, we'll have to use the event trap instead
        // const postConstructSpy = jest.spyOn(Entity.prototype, 'postConstruct');

        const options: EntityOptions & SentientOptions = {
            ai: null,
            name: 'entityUnderTest'
        }
        MakeCharacter([], options);
        expect(manuallyTrackedMockCalls).toContain('CharacterCreated');
        // expect(postConstructSpy).toHaveBeenCalledTimes(1);
    });

    it('should call mixin postConstruct', () => {

        const options: EntityOptions & SentientOptions = {
            ai: null,
            name: 'entityUnderTest'
        }
        // maybe populate our playableClass hack?
        MakeCharacter([MakePlayable], options);
        const entityUnderTest = MakeCharacter([MakePlayable], options) as Entity & Playable;
        // const postConstructSpy = jest.spyOn(playableClass.prototype, 'initialize');
        // expect(postConstructSpy).toHaveBeenCalledTimes(1);
        // this is maybe the closest we can do instead for right now, unfortunately
        expect(entityUnderTest.isPlayer).toBeDefined();

        expect(manuallyTrackedMockCalls).toContain('CharacterCreated');
    });
});
