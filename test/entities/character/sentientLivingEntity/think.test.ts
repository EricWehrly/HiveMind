import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import SentientEntity from '../../../../js/entities/character/SentientEntity';
import AI from '../../../../js/ai/basic';

let mockCalled = false;
class mockAI extends AI {
    think = jest.fn().mockImplementation(() => { 
        mockCalled = true;
    });
}

jest.mock('@/engine/js/ai/basic', () => {
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

describe('SentientEntity.think', () => {

    it('will call think if it has ai', () => {
        
        const sentientEntity = new SentientEntity({
            ai: mockAI
        });
        expect(sentientEntity.ai).toBeDefined();
        sentientEntity.think();
        expect(mockCalled).toBe(true);
    });

    it('no ai, no problems', () => {

        const sentientEntity = new SentientEntity({
            ai: null
        });
        try {
            sentientEntity.think();
        } catch (ex) {
            // fail the test if this is hit            
            expect(true).toBe(false);
        }
    });
});
