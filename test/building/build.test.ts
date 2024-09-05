import mockEvents from "../../engine/test/testHelpers/mockEvents";
import mockMap from "../../engine/test/testHelpers/mockMap";
import WorldCoordinate from "../../engine/js/coordinates/WorldCoordinate";
import { MakeLiving } from "../../engine/js/entities/character/mixins/Living";
import Faction from "../../engine/js/entities/faction";
import CharacterType from "../../js/entities/CharacterType";
import Building from "../../js/entities/building";
import { MakeHiveMindCharacter } from "../../js/entities/character/HivemindCharacterFactory";
import { MakeGrowable } from "../../js/entities/character/mixins/Growable";
import { MakeGrower } from "../../js/entities/character/mixins/Grower";
import { MakeSlimey } from "../../js/entities/character/mixins/Slimey";
import Resource from "../../engine/js/entities/resource";
import { MakeCombative } from "../../engine/js/entities/character/mixins/Combative";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

jest.mock('@/js/entities/character/HivemindCharacterFactory', () => ({
    MakeHiveMindCharacter: jest.fn(),
  }));

describe('Building', () => {
    describe('Build', () => {
        
        afterEach(() => {
            jest.resetAllMocks();
        });

        // @ts-expect-error
        const dummyCharacterType = new CharacterType({
            name: 'dummy',
        });

        const food = new Resource({
            name: 'food',
        });

        it('should return a valid object', () => {

            const mockReturnValue = { 
                name: 'DummyBuilding',
                unusedProperty: 'unused'
            };
            (MakeHiveMindCharacter as jest.Mock).mockReturnValue(mockReturnValue);          

            const result = Building.Build(dummyCharacterType, {});
            
            expect(result).toBe(mockReturnValue);
        });

        it('should call the factory method with the correct arguments', () => {

            const dummyFaction = new Faction({ name: 'dummy' });
            food.value = 5;

            const buildingOptions = {
                position: new WorldCoordinate(10, -11),
                faction: dummyFaction,
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
            expect(callArgs[0]).toEqual([MakeGrowable, MakeGrower, MakeLiving, MakeSlimey, MakeCombative]);
            expect(callArgs[1]).toEqual(aggregateOptions);
            expect(callArgs[2]).toEqual(Building);
        });

        it('should return null if resource cost is higher than available', () => {

            food.value = 100;

            const buildingOptions = {
                cost: 105
            };      

            const result = Building.Build(dummyCharacterType, buildingOptions);

            expect(result).toBeNull();
        });

        /* TODO
        it('should handle food reservation', () => {
        });
        */

        // let's have this 'grow' the building as well ...
    });
});
