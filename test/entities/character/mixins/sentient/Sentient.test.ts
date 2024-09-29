import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import Entity, { EntityOptions } from "../../../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import { IsSentient, MakeSentient, Sentient } from "../../../../../js/entities/character/mixins/Sentient";
import { IsLiving, Living, MakeLiving } from "../../../../../js/entities/character/mixins/Living";

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

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeCharacter([MakeSentient], options, TestExtendedEntity);
        const characterUnderTest = MakeCharacter([], options);

        expect(IsSentient(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsSentient(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeCharacter([MakeLiving, MakeSentient], {}) as Entity & Sentient & Living;
        const characterUnderTest = MakeCharacter([MakeSentient], {}) as Entity & Sentient & Living;

        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(false);
        expect(IsSentient(character)).toBe(true);
        expect(IsSentient(characterUnderTest)).toBe(true);
    });
});
