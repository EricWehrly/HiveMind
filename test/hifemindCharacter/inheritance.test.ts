import { expect } from '@jest/globals';
import mockMap from '../../engine/test/testHelpers/mockMap';
import HiveMindCharacter from '../../js/entities/character/HiveMindCharacter';
import NodeAI from '../../js/ai/node';

jest.mock('@/engine/js/action.ts', () => {
    return {
        List: {}
    }
});

jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

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

describe('HivemindCharacter.ctor', () => {
    
    it('should support ai constructor argument', () => {
        const character = new HiveMindCharacter({
            ai: NodeAI
            // this is a hack, and will change if we private the constructor ...
            ,calledByFactory: true
        });
        expect(character.ai).toBeDefined();
        if (!(character.ai instanceof NodeAI)) {            
            console.log(JSON.stringify(character.ai));
        }
        expect(character.ai instanceof NodeAI).toBeTruthy();
    });
});
