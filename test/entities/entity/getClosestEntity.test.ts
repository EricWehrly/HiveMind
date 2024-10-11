import { expect } from '@jest/globals';
import mockEvents from '../../testHelpers/mockEvents';
import mockMap from '../../testHelpers/mockMap';
import Entity from '../../../js/entities/character/Entity';
import CharacterType, { CharacterTypeOptions } from '../../../../js/entities/CharacterType';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Entity.getClosestEntity', () => {

    let entityUnderTest: Entity;

    beforeAll(() => {
        entityUnderTest = new Entity({
            name: 'entityUnderTest',
            position: {
                x: 1,
                y: 1
            }
        });
    });

    afterAll(() => {
        entityUnderTest.destroy();
    });

    it('returns null if there are no other entities', () => {

        let options = {};
        expect(entityUnderTest).toBeDefined();
        const result = entityUnderTest.getClosestEntity(options);

        expect(result).toBe(null);
    });

    it('returns the other entity', () => {

        const secondEntity = new Entity({
            name: 'secondEntity',
            position: {
                x: 2,
                y: 2
            }
        });

        let options = {};
        expect(entityUnderTest).toBeDefined();
        const result = entityUnderTest.getClosestEntity(options);

        expect(result).toBe(secondEntity);
        secondEntity.destroy();
    });

    it('should filter characterType', () => {
        let characterTypeOptions: CharacterTypeOptions = {
            name: 'Food'
        };
        const food = CharacterType.Create(characterTypeOptions);
        characterTypeOptions.name = 'Other';
        const other = CharacterType.Create(characterTypeOptions);

        const foodDist = 2;
        const otherDist = 1;
        const foodEntity = new Entity({
            name: 'farFood',
            characterType: food,
            position: {
                x: entityUnderTest.position.x + foodDist,
                y: entityUnderTest.position.y + foodDist
            }
        });
        const otherEntity = new Entity({
            name: 'closeOther',
            characterType: other,
            position: {
                x: entityUnderTest.position.x + otherDist,
                y: entityUnderTest.position.y + otherDist
            }
        });

        let options = {
            characterType: food
        };
        expect(entityUnderTest).toBeDefined();
        const result = entityUnderTest.getClosestEntity(options);

        // expect(result.equals(foodEntity)).toBe(true);
        expect(result.equals(foodEntity) ? true : result.name).toBe(true);
        foodEntity.destroy();
        otherEntity.destroy();
    });

    // TODO: test for the different method options
});
