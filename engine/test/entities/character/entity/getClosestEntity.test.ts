import { expect } from '@jest/globals';
import Entity from '../../../../js/entities/character/Entity';

jest.mock('../../../../js/events.mjs', () => {
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
jest.mock('../../../../js/mapping/map.mjs', () => ({
    Map: {
        getChunk: jest.fn().mockImplementation(() => { }),
    }
}));

describe('Entity.getClosestEntity', () => {

    let entity: Entity;

    beforeAll(() => {
        entity = new Entity({});
    });

    it('returns the closest entity based on the provided options', () => {
        let options = {};
        expect(entity).toBeDefined();
        // const result = entity.getClosestEntity(options);

        // Make your assertions
        // assert.equal(result, expectedEntity);
    });
});
