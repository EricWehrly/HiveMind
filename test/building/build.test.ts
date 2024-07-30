import { MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import mockMap from "../../engine/test/testHelpers/mockMap";
import CharacterType from "../../js/entities/CharacterType";
import Building from "../../js/entities/building";
import { MakeHiveMindCharacter } from "../../js/entities/character/CharacterFactory";
import { MakeGrowable } from "../../js/entities/character/mixins/Growable";
import { MakeGrower } from "../../js/entities/character/mixins/Grower";
import { MakeSlimey } from "../../js/entities/character/mixins/Slimey";

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

jest.mock('@/js/entities/character/CharacterFactory', () => ({
    MakeHiveMindCharacter: jest.fn(),
  }));

describe('Building', () => {
    describe('Build', () => {

        // @ts-expect-error
        const dummyCharacterType = new CharacterType({
            name: 'dummy',
        });

        // TODO: correct arguments
        it('should call the factory method with the correct arguments', () => {

            const buildingOptions = {
                cost: 2
            };

            Building.Build(dummyCharacterType, buildingOptions);

            const aggregateOptions = {
                name: dummyCharacterType.name,
                ...dummyCharacterType,
                ...buildingOptions
            };

            expect(MakeHiveMindCharacter).toHaveBeenCalledTimes(1);
            const callArgs = (MakeHiveMindCharacter as jest.Mock).mock.calls[0];
            console.log(callArgs);
            expect(callArgs[0]).toEqual([MakeGrowable, MakeGrower, MakeLiving, MakeSlimey]);
            expect(callArgs[1]).toEqual(aggregateOptions);
            expect(callArgs[2]).toEqual(Building);
        });

        it('should return null if resource cost is higher than available', () => {
        });

        it('should handle food reservation', () => {
        });

        // let's have this 'grow' the building as well ...
    });
});
