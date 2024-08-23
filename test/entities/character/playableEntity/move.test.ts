import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import PlayableEntity from '../../../../js/entities/character/PlayableEntity';
import Vector from '../../../../js/baseTypes/Vector';

jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});

let manuallyTrackedMockCalls: string[] = [];
// TODO: fix this mocking when we move events to ts
jest.mock('@/engine/js/events', () => {
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
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('PlayableEntity.move', () => {

    let entity: PlayableEntity;

    beforeEach(() => {
        entity = new PlayableEntity({
            isPlayer: true,
            position: {
                x: 1,
                y: 1
            }
        });
        entity.desiredMovementVector = new Vector(1, 1);
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
