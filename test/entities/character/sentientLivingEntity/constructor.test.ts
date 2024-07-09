import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import SentientLivingEntity from '../../../../js/entities/character/SentientLivingEntity';
import AI from '../../../../js/ai/basic';

jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
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
