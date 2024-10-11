import mockEvents from "../../../../engine/test/testHelpers/mockEvents";
import mockMap from "../../../../engine/test/testHelpers/mockMap";
import HiveMindCharacter from "../../../../js/entities/character/HiveMindCharacter";
import { MakeHiveMindCharacter } from "../../../../js/entities/character/HivemindCharacterFactory";
import { IsLiving, Living, MakeLiving } from "../../../../engine/js/entities/character/mixins/Living";
import { Growable, GrowableConfig, IsGrowable, MakeGrowable } from "../../../../js/entities/character/mixins/Growable";
import { MakeSentient, Sentient } from "../../../../engine/js/entities/character/mixins/Sentient";
import AI from "../../../../engine/js/ai/basic";
import { EntityOptions } from "../../../../engine/js/entities/character/EntityOptions";

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

    it('should digest all constructor parameters', () => {
        const options: EntityOptions & GrowableConfig = {
            cost: 1,
            interval: 575,
            mixins: [ MakeGrowable, MakeSentient ]
        };
        const character = MakeHiveMindCharacter([MakeGrowable, MakeSentient], options) as HiveMindCharacter & Growable & Sentient;
        expect(character.growConfig.interval).toBe(575);
        expect(character.growConfig.mixins).toEqual([MakeGrowable, MakeSentient]);
    });

    it('growth should start at 0 (so that it can grow from there)', () => {
        const character = MakeHiveMindCharacter([MakeGrowable, MakeSentient], {}) as HiveMindCharacter & Growable & Sentient;

        expect(character.growth).toBe(0);
    });
    
    it('should register onThink with AI', () => {
        const spy = jest.spyOn(AI.prototype, 'RegisterThinkMethod');
        MakeHiveMindCharacter([MakeGrowable, MakeSentient], {}) as HiveMindCharacter & Growable & Sentient;
    
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeHiveMindCharacter([MakeGrowable], options, TestExtendedEntity);
        const characterUnderTest = MakeHiveMindCharacter([], options);

        expect(IsGrowable(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsGrowable(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeHiveMindCharacter([MakeLiving, MakeGrowable], {}) as HiveMindCharacter & Growable;
        const character2 = MakeHiveMindCharacter([MakeLiving], {}) as HiveMindCharacter & Living;

        expect(IsGrowable(character)).toBe(true);
        expect(IsLiving(character2)).toBe(true);
        expect(IsGrowable(character2)).toBe(false);
    });
});
