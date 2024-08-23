import { expect } from '@jest/globals';
import mockMap from '../../testHelpers/mockMap';
import Entity from '../../../js/entities/character/Entity';

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
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Entity.getClosestEntity', () => {

    let entity: Entity;

    beforeAll(() => {
        entity = new Entity({
            position: {
                x: 1,
                y: 1
            }
        });
    });

    it('returns null if there are no other entities', () => {

        let options = {};
        expect(entity).toBeDefined();
        const result = entity.getClosestEntity(options);

        expect(result).toBe(null);
    });

    it('returns the other entity', () => {

        const secondEntity = new Entity({
            position: {
                x: 2,
                y: 2
            }
        });

        let options = {};
        expect(entity).toBeDefined();
        const result = entity.getClosestEntity(options);

        expect(result).toBe(secondEntity);
    });

    // TODO: test for the different method options
});
