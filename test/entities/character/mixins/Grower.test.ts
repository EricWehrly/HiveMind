import mockEvents from "../../../../engine/test/testHelpers/mockEvents";
import mockMap from "../../../../engine/test/testHelpers/mockMap";
import { EntityOptions } from "../../../../engine/js/entities/character/Entity";
import HiveMindCharacter from "../../../../js/entities/character/HiveMindCharacter";
import { MakeHiveMindCharacter } from "../../../../js/entities/character/HivemindCharacterFactory";
import { IsLiving, Living, MakeLiving } from "../../../../engine/js/entities/character/mixins/Living";
import { Grower, IsGrower, MakeGrower } from "../../../../js/entities/character/mixins/Grower";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('character factory', () => {

    // TODO: move to util class?
    class TestExtendedEntity extends HiveMindCharacter {
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
        const character = MakeHiveMindCharacter([MakeGrower], options, TestExtendedEntity);
        const characterUnderTest = MakeHiveMindCharacter([], options);

        expect(IsGrower(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsGrower(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeHiveMindCharacter([MakeLiving, MakeGrower], {}) as HiveMindCharacter & Grower;
        const characterUnderTest = MakeHiveMindCharacter([MakeLiving], {}) as HiveMindCharacter & Living;

        expect(IsGrower(character)).toBe(true);
        expect(IsGrower(characterUnderTest)).toBe(false);
        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(true);
    });
});
