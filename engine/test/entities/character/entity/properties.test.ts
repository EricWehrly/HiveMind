import { expect } from '@jest/globals';
import Entity from '../../../../js/entities/character/Entity';
import Point from '../../../../js/baseTypes/point.mjs';

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
jest.mock('@/engine/js/mapping/map.mjs', () => ({
    Map: {
        getChunk: jest.fn().mockImplementation(() => { }),
    }
}));

describe('Entity setters', () => {

    let entity: Entity;

    beforeEach(() => {
        entity = new Entity({
            position: {
                x: 1,
                y: 1
            }
        });
    });
    
    it('should update lastPosition when position changes', () => {
        entity.lastPosition = new Point(6, 10);
        entity.position = { x: 2, y: 3 };
        expect(entity.lastPosition.x).toBe(2);
        expect(entity.lastPosition.y).toBe(3);
    });

    it('should set lastPosition from null on position update', () => {

        expect(entity.lastPosition).toBe(null);

        entity.position = { x: 2, y: 3 };
        expect(entity.lastPosition).toBeDefined();
        expect(entity.lastPosition.x).toBe(2);
        expect(entity.lastPosition.y).toBe(3);
    });
});
