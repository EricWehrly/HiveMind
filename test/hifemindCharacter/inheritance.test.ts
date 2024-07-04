import { expect } from '@jest/globals';
import HiveMindCharacter from '../../js/entities/character-extensions.mjs';
import NodeAI from '../../js/ai/node.mjs';

jest.mock('@/engine/js/action.mjs', () => {
    return {
        List: {}
    }
});
jest.mock('@/engine/js/mapping/map.ts', () => ({
    Map: {
        getChunk: jest.fn().mockImplementation(() => {
            return {
                equals: () => { return false; }
            };
         }),
    }
}));

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

describe('HivemindCharacter.ctor', () => {
    
    it('should support ai constructor argument', () => {
        const character = new HiveMindCharacter({
            ai: NodeAI
        });
        expect(character.ai).toBeDefined();
        if (!(character.ai instanceof NodeAI)) {            
            console.log(JSON.stringify(character.ai));
        }
        expect(character.ai instanceof NodeAI).toBeTruthy();
    });
});
