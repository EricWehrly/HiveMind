import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import Entity from "../../../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import { IsEquipped, MakeEquipped, Equipped, EquippedOptions } from "../../../../../js/entities/character/mixins/Equipped";
import { IsLiving, Living, MakeLiving } from "../../../../../js/entities/character/mixins/Living";
import Technology from "../../../../../js/technology";
import { TechnologyTypes } from "../../../../../js/TechnologyTypes";
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
        const testTech = new Technology({ name: 'test', type: TechnologyTypes.BUFF});

        const options: EntityOptions & EquippedOptions = {
            cost: 1,
            technologies: [testTech]
        };
        const character = MakeCharacter([MakeEquipped], options) as Entity & Equipped;

        expect(character.technologies.includes(testTech)).toBe(true);
    });

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeCharacter([MakeEquipped], options, TestExtendedEntity);
        const characterUnderTest = MakeCharacter([], options);

        expect(IsEquipped(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsEquipped(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeCharacter([MakeLiving, MakeEquipped], {}) as Entity & Equipped & Living;
        const characterUnderTest = MakeCharacter([MakeEquipped], {}) as Entity & Equipped & Living;

        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(false);
        expect(IsEquipped(character)).toBe(true);
        expect(IsEquipped(characterUnderTest)).toBe(true);
    });
});
