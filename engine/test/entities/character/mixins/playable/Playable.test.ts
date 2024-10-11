import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import Entity from "../../../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import { IsPlayable, MakePlayable, Playable, PlayableOptions } from "../../../../../js/entities/character/mixins/Playable";
import { IsLiving, Living, MakeLiving } from "../../../../../js/entities/character/mixins/Living";
import { EntityOptions } from "../../../../../js/entities/character/EntityOptions";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('character factory', () => {

    // TODO: move to util class?
    class TestExtendedEntity extends Entity {
        constructorCalls = 0;

        constructor(options: EntityOptions) {
            super(options);
            this.constructorCalls++;
        }
    };

    it('should digest all constructor parameters', () => {
        const options: EntityOptions & PlayableOptions = {
            cost: 1,
            isPlayer: true,
            position: { x: 5, y: -3 }
        };
        const character = MakeCharacter([MakePlayable], options) as Entity & Playable;

        expect(character.isPlayer).toBe(true);
        // cheat and use private properties to assert, rather than exposing something
        // @ts-expect-error
        expect(character._lastPosition.x).toEqual(5);
        // @ts-expect-error
        expect(character._lastPosition.y).toEqual(-3);
    });

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeCharacter([MakePlayable], options, TestExtendedEntity);
        const characterUnderTest = MakeCharacter([], options);

        expect(IsPlayable(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsPlayable(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeCharacter([MakeLiving, MakePlayable], {}) as Entity & Playable & Living;
        const characterUnderTest = MakeCharacter([MakePlayable], {}) as Entity & Playable & Living;

        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(false);
        expect(IsPlayable(character)).toBe(true);
        expect(IsPlayable(characterUnderTest)).toBe(true);
    });
});
