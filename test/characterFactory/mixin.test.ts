import mockMap from "../../engine/test/testHelpers/mockMap";
import { MakeHiveMindCharacter } from "../../js/entities/character/HivemindCharacterFactory";
import HiveMindCharacter from "../../js/entities/character/HiveMindCharacter";
import { Growable, MakeGrowable } from "../../js/entities/character/mixins/Growable";
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
jest.mock('@/engine/js/mapping/map.ts', () => mockMap);

// we can get rid of this when we move to a structured type for the Entity constructor ...
interface CharacterOptions {
    ai: any;
    parent: HiveMindCharacter;
    speed: number;
    name: string;
}

describe('HivemindChacterFactory.MakeHiveMindCharacter', () => {

    const referenceEntity = MakeHiveMindCharacter([], {
        ai: null,
        name: 'Reference'
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
    
        it('should apply mixin parameters to mixed entity', () => {
            expect(slimey.parent).toBe(referenceEntity);
        });
    });

    describe('extended class', () => {
        it('should call super methods for base class', () => {
            const character = MakeHiveMindCharacter([MakeGrowable], {}) as HiveMindCharacter & Growable;
            const spy = jest.spyOn(HiveMindCharacter.prototype, 'canBeEaten');

            let canBeEaten = character.canBeEaten(referenceEntity);
            let isGrown = character.isGrown;

            expect(spy).toHaveBeenCalledWith(referenceEntity);

            expect(canBeEaten && isGrown).toBe(true);

            character.grow(1);
            canBeEaten = character.canBeEaten(referenceEntity);
            isGrown = character.isGrown;
            expect(spy).toHaveBeenCalledWith(referenceEntity);
            expect(canBeEaten && isGrown).toBe(false);
        
            spy.mockRestore();
        });
    });
});
