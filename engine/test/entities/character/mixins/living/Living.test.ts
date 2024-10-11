import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import Entity from "../../../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import { IsLiving, MakeLiving, Living, LivingOptions } from "../../../../../js/entities/character/mixins/Living";
import { IsSentient, Sentient, MakeSentient } from "../../../../../js/entities/character/mixins/Sentient";
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
        const options: EntityOptions & LivingOptions = {
            cost: 1,
            health: 72,
        };
        const character = MakeCharacter([MakeLiving], options) as Entity & Living;

        expect(character.health).toBe(72);
        expect(character.maxHealth).toBe(72);
    });

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeCharacter([MakeLiving], options, TestExtendedEntity);
        const characterUnderTest = MakeCharacter([], options);

        expect(IsLiving(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsLiving(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeCharacter([MakeSentient, MakeLiving], {}) as Entity & Living & Sentient;
        const characterUnderTest = MakeCharacter([MakeLiving], {}) as Entity & Living & Sentient;

        expect(IsSentient(character)).toBe(true);
        expect(IsSentient(characterUnderTest)).toBe(false);
        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(true);
    });
});
