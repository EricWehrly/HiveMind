import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import AI from '../../../../js/ai/basic';
import { MakeCharacter } from '../../../../js/entities/character/CharacterFactory';
import { MakeSentient, Sentient } from '../../../../js/entities/character/mixins/Sentient';
import Entity from '../../../../js/entities/character/Entity';

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
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('SentientEntity.ctor', () => {
    it('should have no ai if null is passed', () => {
        const sentientEntity = MakeCharacter([MakeSentient], {
            ai: null
        }) as Entity & Sentient;

        expect(sentientEntity.ai).toBeUndefined();
    });

    it('should make a basic ai if undefined is passed', () => {
        const sentientEntity = MakeCharacter([MakeSentient], {}) as Entity & Sentient;

        expect(sentientEntity.ai instanceof AI).toBe(true);
    });

    it('should make a new ai instance if a type is passed', () => {
        const sentientEntity = MakeCharacter([MakeSentient], {
            ai: AI
        }) as Entity & Sentient;;

        expect(sentientEntity.ai instanceof AI).toBe(true);
    });
});
