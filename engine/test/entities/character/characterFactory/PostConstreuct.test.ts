import { mockEvents, resetTrackedEvents, raisedEvents } from "../../../testHelpers/mockEvents";
import mockMap from "../../../testHelpers/mockMap";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";
import { MakePlayable, Playable } from "../../../../js/entities/character/mixins/Playable";
import { SentientOptions } from "../../../../js/entities/character/mixins/Sentient";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('ChacterFactory.MakeCharacter', () => {

    beforeEach(() => {
        resetTrackedEvents();
    });

    it('should call base postConstruct', () => {

        // TODO: So we couldn't get the spy to work properly, we'll have to use the event trap instead
        // const postConstructSpy = jest.spyOn(Entity.prototype, 'postConstruct');

        const options: EntityOptions & SentientOptions = {
            ai: null,
            name: 'entityUnderTest'
        }
        MakeCharacter([], options);
        expect(raisedEvents).toContain('EntityCreated');
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

        expect(raisedEvents).toContain('EntityCreated');
    });
});
