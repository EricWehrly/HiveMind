import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import { Combatant } from '../../../../js/entities/character/Combatant';
import Entity from '../../../../js/entities/character/Entity';
import SentientLivingEntity from '../../../../js/entities/character/SentientLivingEntity';

// https://stackoverflow.com/a/54475733/5450892
jest.mock('@/engine/js/entities/character.ts', () => require('../../../testHelpers/helpers').createMock);
jest.mock('@/engine/js/ai/basic.mjs',  () => require('../../../testHelpers/helpers').createMock);
jest.mock('@/engine/js/ai/predator.mjs',  () => require('../../../testHelpers/helpers').createMock);
jest.mock('@/engine/js/mapping/map.ts', () => mockMap);
jest.mock('@/engine/js/coordinates/point', () => {
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

describe('Combatant.think', () => {

    let combatant: Combatant;
    let secondEntity: Entity;
    beforeEach(() => {
        combatant = new Combatant({
            ai: null,
            isPlayer: true
        });
        secondEntity = new Entity({});
    });
    
    Entity.prototype.getClosestEntity = jest.fn().mockImplementation((options) => {
        return secondEntity;
    });

    it('will super think', () => {
        const spy = jest.spyOn(SentientLivingEntity.prototype, 'think');

        combatant.think();
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('if player, sets target to closest entity', () => {

        expect(combatant.target).toBe(undefined);

        combatant.isPlayer = true;

        combatant.think();

        expect(combatant.target).toBe(secondEntity);
    });
});
