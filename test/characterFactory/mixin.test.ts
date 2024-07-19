import mockMap from "../../engine/test/testHelpers/mockMap";
import { MakeHiveMindCharacter } from "../../js/entities/character/CharacterFactory";
import HiveMindCharacter from "../../js/entities/character/HiveMindCharacter";
import { MakeSlimey, Slimey } from "../../js/entities/character/mixins/Slimey";

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
jest.mock('@/engine/js/mapping/map.ts', () => mockMap);

// we can get rid of this when we move to a structured type for the Entity constructor ...
interface CharacterOptions {
    ai: any;
    parent: HiveMindCharacter;
    speed: number;
    name: string;
}

describe('ChacterFactory.MakeHiveMindCharacter', () => {

    const referenceEntity = MakeHiveMindCharacter([], {
        ai: null,
        name: 'Reference'
    });

    describe('no mixins', () => {
        it('should construct a valid entity', () => {
            expect(referenceEntity).not.toBeNull();
            // we're going to need to rewrite this when we private HiveMindCharacter
            expect(referenceEntity instanceof HiveMindCharacter).toBeTruthy();
        });

        it('should have constructor-assigned properties', () => {
            const strength = referenceEntity.getAttribute('Strength')?.value;
            expect(strength).toBe(1);
        });
    });

    describe('one mixin', () => {
        const slimeMixin = [MakeSlimey];

        const characterOptions: CharacterOptions = {
            ai: null,
            parent: referenceEntity,
            speed: 3,
            name: 'Slimey'
        };
        const character = MakeHiveMindCharacter(slimeMixin, characterOptions);
        const slimey = character as HiveMindCharacter & Slimey;
    
        it('should construct valid base type', () => {
            expect(character).not.toBeNull();
            // we're going to need to rewrite this when we private HiveMindCharacter
            expect(character instanceof HiveMindCharacter).toBeTruthy();
            expect(slimey.canBeStudied).toBeDefined();
        });
    
        it('should apply parameters to base entity', () => {
            const Speed = slimey.getAttribute('Speed')?.value;
            expect(Speed).toBe(characterOptions.speed);
        });
    
        it('should apply mixin parameters to mixed entity', () => {
            expect(slimey.parent).toBe(referenceEntity);
        });
    
        it('should apply functionality from mixin to entity', () => {
            expect(slimey.Subdivide).toBeDefined();
        });
    });

    describe('multiple mixins', () => {
        // TODO
    });
});
