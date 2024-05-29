import { expect } from '@jest/globals';
import SentientLivingEntity from '../../../../js/entities/character/SentientLivingEntity';
import AI from '../../../../js/ai/basic.mjs';

jest.mock('../../../../js/ai/basic.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});
jest.mock('@/engine/js/baseTypes/point.mjs', () => {
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

describe('SentientLivingEntity.ctor', () => {
    it('should have no ai if null is passed', () => {
        const sentientLivingEntity = new SentientLivingEntity({
            ai: null
        });

        expect(sentientLivingEntity.ai).toBeUndefined();
    });

    it('should make a basic ai if undefined is passed', () => {
        const sentientLivingEntity = new SentientLivingEntity({});

        expect(sentientLivingEntity.ai instanceof AI).toBe(true);
    });

    it('should make a new ai instance if a type is passed', () => {
        const sentientLivingEntity = new SentientLivingEntity({
            ai: AI
        });

        expect(sentientLivingEntity.ai instanceof AI).toBe(true);
    });
});