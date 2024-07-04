import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import SentientLivingEntity from '../../../../js/entities/character/SentientLivingEntity';
import AI from '../../../../js/ai/basic.mjs';

let mockCalled = false;
class mockAI extends AI {
    think = jest.fn().mockImplementation(() => { 
        mockCalled = true;
    });
}

jest.mock('../../../../js/ai/basic.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn(),
    };
});
jest.mock('@/engine/js/coordinates/point.ts', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((x, y) => {})
    }
});
jest.mock('@/engine/js/events.mjs', () => {
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

describe('SentientLivingEntity.think', () => {

    it('will call think if it has ai', () => {
        
        const sentientLivingEntity = new SentientLivingEntity({
            ai: mockAI
        });
        expect(sentientLivingEntity.ai).toBeDefined();
        sentientLivingEntity.think();
        expect(mockCalled).toBe(true);
    });

    it('no ai, no problems', () => {

        const sentientLivingEntity = new SentientLivingEntity({
            ai: null
        });
        try {
            sentientLivingEntity.think();
        } catch (ex) {
            // fail the test if this is hit            
            expect(true).toBe(false);
        }
    });
});
