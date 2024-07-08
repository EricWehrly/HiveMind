import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import { Combatant } from '../../../../js/entities/character/Combatant';
import AI from '../../../../js/ai/basic';
import PlayableEntity from '../../../../js/entities/character/PlayableEntity';
import LivingEntity from '../../../../js/entities/character/LivingEntity';

// https://stackoverflow.com/a/54475733/5450892
jest.mock('@/engine/js/entities/character.ts', () => require('../../../testHelpers/helpers').createMock);
jest.mock('@/engine/js/ai/predator',  () => require('../../../testHelpers/helpers').createMock);
jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});
jest.mock('@/engine/js/mapping/map.ts', () => mockMap);
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

describe('Combatant.move', () => {

    let combatant: Combatant;
    let secondEntity: LivingEntity;
    beforeEach(() => {
        combatant = new Combatant({
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        });
        secondEntity = new LivingEntity({
            position: {
                x: 1,
                y: 1
            }
        });
    });

    it('should move toward target', () => {
        expect(combatant.position.x).toEqual(0);
        combatant.target = secondEntity;
        combatant.move(2);
        expect(combatant.position.x).toEqual(1);
    });

    it('should not move past target', () => {
        expect(combatant.position.x).toEqual(0);
        combatant.target = secondEntity;
        combatant.move(5);
        expect(combatant.position.x).toEqual(1);
    });

    it('should call afterMove if moving to target', () => {
        combatant.target = secondEntity;
        const spy = jest.spyOn(Combatant.prototype, 'afterMove');

        expect(combatant.position.x).toEqual(0);
        combatant.move(2);
        expect(combatant.position.x).toEqual(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('should call super move if not moving to target', () => {
        combatant.target = null;
        const spy = jest.spyOn(Combatant.prototype, 'move');

        combatant.move(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('should not call super move if moving to target', () => {
        combatant.target = secondEntity;
        const spy = jest.spyOn(PlayableEntity.prototype, 'move');

        combatant.move(1);
    
        expect(spy).not.toHaveBeenCalled();
    
        spy.mockRestore();
    });
});
