import { expect } from '@jest/globals';
import mockMap from '../../../testHelpers/mockMap';
import { Combatant } from '../../../../js/entities/character/Combatant';
import AI from '../../../../js/ai/basic';
import WorldCoordinate from '../../../../js/coordinates/WorldCoordinate';
import Entity from '../../../../js/entities/character/Entity';

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

describe('Combatant.target', () => {

    let combatant: Combatant;
    let secondEntity: Entity;
    beforeEach(() => {
        combatant = new Combatant({
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        });
        secondEntity = new Entity({
            position: {
                x: 1,
                y: 1
            }
        });
    });

    it('should set to target position', () => {
        expect(combatant.position.x).toEqual(0);
        combatant.target = secondEntity;
        expect(combatant.target).toEqual(secondEntity);
    });

    it('should set to target entity', () => {
        expect(combatant.position.x).toEqual(0);
        const position = new WorldCoordinate(1, 1);
        combatant.target = position;
        expect(combatant.target).toEqual(position);
        expect(combatant.targetPosition).toEqual(position);
    });

    it('should follow moving target', () => {
        expect(combatant.position.x).toEqual(0);
        combatant.target = secondEntity;
        secondEntity.move(2);
        expect(combatant.target.x).toEqual(secondEntity.position.x);
        expect(combatant.target.y).toEqual(secondEntity.position.y);
    });
});
