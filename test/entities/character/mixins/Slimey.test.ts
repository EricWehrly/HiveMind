import mockEvents from "../../../../engine/test/testHelpers/mockEvents";
import mockMap from "../../../../engine/test/testHelpers/mockMap";
import { EntityOptions } from "../../../../engine/js/entities/character/Entity";
import HiveMindCharacter from "../../../../js/entities/character/HiveMindCharacter";
import { MakeHiveMindCharacter } from "../../../../js/entities/character/HivemindCharacterFactory";
import { IsSlimey, MakeSlimey, Slimey } from "../../../../js/entities/character/mixins/Slimey";
import { IsLiving, Living, MakeLiving } from "../../../../engine/js/entities/character/mixins/Living";

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
        const character = MakeHiveMindCharacter([MakeSlimey], options, TestExtendedEntity);
        const characterUnderTest = MakeHiveMindCharacter([], options);

        expect(IsSlimey(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsSlimey(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeHiveMindCharacter([MakeLiving, MakeSlimey], {}) as HiveMindCharacter & Slimey;
        const characterUnderTest = MakeHiveMindCharacter([MakeLiving], {}) as HiveMindCharacter & Living;

        expect(IsLiving(character)).toBe(true);
        expect(IsSlimey(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(true);
        expect(IsSlimey(characterUnderTest)).toBe(false);
    });
});
