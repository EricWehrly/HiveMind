import { mockEvents } from "../../../testHelpers/mockEvents";
import mockMap from "../../../testHelpers/mockMap";
import { IsLiving, Living, LivingOptions, MakeLiving } from "../../../../js/entities/character/mixins/Living";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";
import { IsSentient, MakeSentient, Sentient, SentientOptions } from "../../../../js/entities/character/mixins/Sentient";

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

    describe('no mixins', () => {
        it('should construct a valid entity', () => {
            expect(referenceEntity).not.toBeNull();
            expect(referenceEntity instanceof Entity).toBeTruthy();
        });

        it('should have constructor-assigned properties', () => {
            expect(referenceEntity.id).toBeDefined();
            expect(referenceEntity.id).not.toBeNull();
        });
    });

    describe('one mixin', () => {
        const livingMixin = [MakeLiving];

        const characterOptions: EntityOptions & LivingOptions = {
            speed: 3,
            health: 1
        };
        const character = MakeCharacter(livingMixin, characterOptions);
        const livin = character as Entity & Living;
    
        it('should construct valid base type', () => {
            expect(character).not.toBeNull();
            expect(character instanceof Entity).toBeTruthy();
            expect(livin.addAttribute).toBeDefined();
        });
    
        it('should apply parameters to base entity', () => {
            const Speed = livin.getAttribute('Speed')?.value;
            expect(Speed).toBe(characterOptions.speed);
        });
    
        it('should apply mixin parameters to mixed entity', () => {
            // this was better when we had references to pass for the test
            // so it's kind of duplicated in the game tests for now
            expect(livin.isAlive).toBe(true);
        });
    
        it('should apply functionality from mixin to entity', () => {
            expect(livin.damage).toBeDefined();
        });
    });

    describe('extended class', () => {

        class TestExtendedEntity extends Entity {
            constructorCalls = 0;

            constructor(options: EntityOptions) {
                super(options);
                this.constructorCalls++;
            }
        };

        it('should instantiate as a class that extends the base', () => {
            const options: EntityOptions = {
                cost: 1
            };
            const character = MakeCharacter([MakeLiving], options, TestExtendedEntity);
            expect(character instanceof TestExtendedEntity).toBeTruthy();
            expect(character.constructorCalls).toBe(1);
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
        });
    });

    describe(('on reuse'), () => {
        it('should not share state between instances', () => {
            const character = MakeCharacter([MakeLiving], {}) as Entity & Living;
            const character2 = MakeCharacter([MakeSentient], {}) as Entity & Sentient;

            expect(IsLiving(character)).toBe(true);
            expect(IsSentient(character2)).toBe(true);
            expect(IsLiving(character2)).toBe(false);
            expect(IsSentient(character)).toBe(false);
        });
    });
});
