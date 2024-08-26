import { expect } from '@jest/globals';
import mockEvents from '../../testHelpers/mockEvents';
import mockMap from '../../testHelpers/mockMap';
import Entity from '../../../js/entities/character/Entity';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Entity.getNearbyEntities', () => {

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

    it('should filter the calling entity', () => {
        
        const secondEntity = new Entity({
            name: 'secondEntity',
            position: {
                x: 2,
                y: 2
            }
        });

        const result = entityUnderTest.getNearbyEntities();
        const resultingEntities = result.map(sortingEntity => sortingEntity.entity);
        expect(resultingEntities.includes(entityUnderTest)).toBe(false);
        expect(result.length).toBe(1);
    });
});
