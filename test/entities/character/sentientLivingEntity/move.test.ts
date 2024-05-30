import { expect } from '@jest/globals';
import Entity from '../../../../js/entities/character/Entity';
import Point from '../../../../js/baseTypes/point.mjs';
import SentientLivingEntity from '../../../../js/entities/character/SentientLivingEntity';
import Events from '../../../../js/events.mjs';
import AI from '../../../../js/ai/basic.mjs';

jest.mock('../../../../js/ai/basic.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});

let manuallyTrackedMockCalls: string[] = [];
// TODO: fix this mocking when we move events to ts
jest.mock('../../../../js/events.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation((eventName) => {
                manuallyTrackedMockCalls.push(eventName);
             }),
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
        getChunk: jest.fn().mockImplementation(() => {
            return {
                equals: () => { return false; }
            };
         }),
    }
}));

describe('SentientLivingEntity.move', () => {

    let entity: SentientLivingEntity;

    beforeEach(() => {
        entity = new SentientLivingEntity({
            isPlayer: true,
            position: {
                x: 1,
                y: 1
            }
        });
        entity.velocity = { x: 1, y: 1 };
        entity.isPlayer = true;
    });

    it('should notify events when player position changes', () => {

        // TODO: second test for lastPosition is null?
        // line up "lastPosition"
        manuallyTrackedMockCalls = [];
        entity.move(1);
        // expect(Events.default.RaiseEvent).not.toHaveBeenCalledWith('PlayerMoved');
        expect(manuallyTrackedMockCalls).toContain('PlayerMoved');
        expect(manuallyTrackedMockCalls).toContain('PlayerChunkChanged');
        expect(manuallyTrackedMockCalls.length).toBe(2);
    });

    it('should not notify events when player position is unchanged', () => {
        manuallyTrackedMockCalls = [];
        entity.move(0);
        expect(manuallyTrackedMockCalls).not.toContain('PlayerMoved');
    });
});
