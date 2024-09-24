import mockEvents from "../../../testHelpers/mockEvents";
import mockMap from "../../../testHelpers/mockMap";
import { IsLiving, Living, MakeLiving } from "../../../../js/entities/character/mixins/Living";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";
import { IsSentient, MakeSentient, Sentient, SentientOptions } from "../../../../js/entities/character/mixins/Sentient";
import { Equipped, IsEquipped, MakeEquipped } from "../../../../js/entities/character/mixins/Equipped";
import { Combative, IsCombative, MakeCombative } from "../../../../js/entities/character/mixins/Combative";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/entities/resource.ts', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Get: jest.fn().mockImplementation(() => {
                return {
                    available: 100,
                    pay: jest.fn().mockImplementation(() => true),
                    reserve: jest.fn().mockImplementation(() => true)
                };
            })
        }
    }
});
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('ChacterFactory.MakeCharacter', () => {

    const options: EntityOptions & SentientOptions = {
        ai: null,
        name: 'Reference'
    }
    const referenceEntity = MakeCharacter([], options);

    it('should call postConstruct exactly once for each mixin', () => {
    });

    // just use a custom class for these tests: --->
    describe('should create a character with multiple mixins', () => {
        const mixins = [MakeLiving, MakeSentient, MakeEquipped, MakeCombative];

        const characterOptions: EntityOptions = {
            speed: 3
        };
        const character = MakeCharacter(mixins, characterOptions);
        const typedCharacter = character as Entity & Living & Sentient & Combative & Equipped;

        it('should be valid for each Mixin', () => {
            expect(character).not.toBeNull();
            // expect(IsLiving(character)).toBeTruthy();
            expect(IsSentient(character)).toBeTruthy();
            expect(IsCombative(character)).toBeTruthy();
            expect(IsEquipped(character)).toBeTruthy();
        });
    
        it('should construct valid base type', () => {
            expect(character).not.toBeNull();
            expect(character instanceof Entity).toBeTruthy();
            expect(typedCharacter.addAttribute).toBeDefined();
        });
    
        it('should apply parameters to base entity', () => {
            const Speed = typedCharacter.getAttribute('Speed')?.value;
            expect(Speed).toBe(characterOptions.speed);
        });
    
        it('should apply mixin parameters to mixed entity', () => {
            // this was better when we had references to pass for the test
            // so it's kind of duplicated in the game tests for now
            expect(typedCharacter.isAlive).toBe(true);
        });
    
        it('should apply functionality from mixin to entity', () => {
            expect(typedCharacter.damage).toBeDefined();
        });
    });

    // each postconstruct only once, multiple mixins

    // static block only once
    // <--

    describe('extended class', () => {

        class TestExtendedEntity extends Entity {};

        it('should instantiate as a class that extends the base', () => {
            const options: EntityOptions = {
                cost: 1
            };
            const character = MakeCharacter([MakeLiving], options, TestExtendedEntity);
            expect(character instanceof TestExtendedEntity).toBeTruthy();
        });
    });
});
