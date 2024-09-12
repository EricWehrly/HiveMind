import mockMap from "../../../testHelpers/mockMap";
import { Living, MakeLiving } from "../../../../js/entities/character/mixins/Living";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";

jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation(() => { }),
            List: new Proxy({}, {
                get: function(target, name) {
                    return name;
                },
                set: function(target, name, value) {
                    return true;  // Indicate that the assignment succeeded
                }
            })
        }
    };
});
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

    const referenceEntity = MakeCharacter([], {
        ai: null,
        name: 'Reference'
    });

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

        const characterOptions: EntityOptions = {
            speed: 3
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

    describe('multiple mixins', () => {
        // TODO
    });

    describe('extended class', () => {

        class TestExtendedEntity extends Entity {};

        it('should instantiate as a class that extends the base', () => {
            const character = MakeCharacter([MakeLiving], {
                cost: 1
            }, TestExtendedEntity);
            expect(character instanceof TestExtendedEntity).toBeTruthy();
        });
    });
});
