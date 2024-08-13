import { expect } from '@jest/globals';
import mockMap from '../../../../testHelpers/mockMap';
import AI from '../../../../../js/ai/basic';
import PlayableEntity from '../../../../../js/entities/character/PlayableEntity';
import Entity from '../../../../../js/entities/character/Entity';
import { Combative, MakeCombative } from '../../../../../js/entities/character/mixins/Combative';
import { EntityMixin, MakeCharacter } from '../../../../../js/entities/character/CharacterFactory';

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

describe('Combative.move', () => {

    // TODO: This needs to be PlayableEntity for the afterMove reference,
    // which we can remove to downgrade the entity type
    let combative: PlayableEntity & Combative;
    let secondEntity: Entity;
    beforeEach(() => {
        combative = MakeCharacter([MakeCombative as EntityMixin], {
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        }, PlayableEntity) as PlayableEntity & Combative;
        secondEntity = new Entity({
            position: {
                x: 1,
                y: 1
            }
        });
    });

    it('should move toward target', () => {
        expect(combative.position.x).toEqual(0);
        combative.target = secondEntity;
        combative.move(2);
        expect(combative.position.x).toEqual(1);
    });

    it('should not move past target', () => {
        expect(combative.position.x).toEqual(0);
        combative.target = secondEntity;
        combative.move(5);
        expect(combative.position.x).toEqual(1);
    });

    it('should call afterMove if moving to target', () => {
        combative.target = secondEntity;
        const spy = jest.spyOn(PlayableEntity.prototype, 'afterMove');

        expect(combative.position.x).toEqual(0);
        combative.move(2);
        expect(combative.position.x).toEqual(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('should call super move if not moving to target', () => {
        combative.target = null;
        const spy = jest.spyOn(PlayableEntity.prototype, 'move');

        combative.move(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('should not call super move if moving to target', () => {
        combative.target = secondEntity;
        const spy = jest.spyOn(PlayableEntity.prototype, 'move');

        combative.move(1);
    
        expect(spy).not.toHaveBeenCalled();
    
        spy.mockRestore();
    });
});
