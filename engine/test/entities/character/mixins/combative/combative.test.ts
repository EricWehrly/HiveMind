import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import { EntityMixin, MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import Entity from "../../../../../js/entities/character/Entity";
import { Combative, CombativeOptions, IsCombative, MakeCombative } from "../../../../../js/entities/character/mixins/Combative";
import Faction from "../../../../../js/entities/faction";
import { IsLiving, Living, MakeLiving } from "../../../../../js/entities/character/mixins/Living";
import { PlayableOptions } from "../../../../../js/entities/character/mixins/Playable";
import { EntityOptions } from "../../../../../js/entities/character/EntityOptions";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Combative', () => {
    describe('constructor', () => {
        it('should assign faction', () => {
            const faction = new Faction({ name: 'test', color: 'red' });
            const characterOptions: EntityOptions & CombativeOptions = {
                faction
            }
            const combative = MakeCharacter([MakeCombative as EntityMixin], characterOptions) as Entity & Combative;

            expect(combative.faction).toEqual(faction);
        });
    });
});

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
        const testFaction = new Faction({ name: 'test', color: 'red' });

        const options: EntityOptions & CombativeOptions = {
            cost: 1,
            faction: testFaction
        };
        const character = MakeCharacter([MakeCombative], options) as Entity & Combative;

        expect(character.faction).toEqual(testFaction);
    });

    it('should build a player faction', () => {
        const options: EntityOptions & CombativeOptions & PlayableOptions = {
            cost: 1,
            isPlayer: true,
            color: 'cygenta'
        };
        const character = MakeCharacter([MakeCombative], options) as Entity & Combative;

        expect(character.faction.color).toEqual(options.color);
    });

    it('should subsequently default to the base', () => {
        const options: EntityOptions = {
            cost: 1
        };
        const character = MakeCharacter([MakeCombative], options, TestExtendedEntity);
        const characterUnderTest = MakeCharacter([], options);

        expect(IsCombative(character)).toBe(true);
        expect(characterUnderTest instanceof TestExtendedEntity).toBe(false);
        expect(IsCombative(characterUnderTest)).toBe(false);

        expect(character.constructorCalls).toBe(1);
        expect((characterUnderTest as TestExtendedEntity).constructorCalls).toBeUndefined();
    });
    
    it('should not share state between instances', () => {
        const character = MakeCharacter([MakeLiving, MakeCombative], {}) as Entity & Combative & Living;
        const characterUnderTest = MakeCharacter([MakeCombative], {}) as Entity & Combative & Living;

        expect(IsLiving(character)).toBe(true);
        expect(IsLiving(characterUnderTest)).toBe(false);
        expect(IsCombative(character)).toBe(true);
        expect(IsCombative(characterUnderTest)).toBe(true);
    });
});
