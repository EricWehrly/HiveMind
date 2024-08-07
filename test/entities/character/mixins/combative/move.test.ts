import { expect } from '@jest/globals';
import mockMap from '../../../../testHelpers/mockMap';
import { Combatant } from '../../../../../js/entities/character/Combatant';
import AI from '../../../../../js/ai/basic';
import PlayableEntity from '../../../../../js/entities/character/PlayableEntity';
import Entity from '../../../../../js/entities/character/Entity';
import { Combative, MakeCombative } from '../../../../../js/entities/character/mixins/Combative';
import { EntityMixin, MakeCharacter } from '../../../../../js/entities/character/CharacterFactory';
import SentientEntity from '../../../../../js/entities/character/SentientEntity';

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

    let combative: SentientEntity & Combative;
    let secondEntity: Entity;
    beforeEach(() => {
        combative = MakeCharacter([MakeCombative as EntityMixin], {
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        }, SentientEntity) as SentientEntity & Combative;
        /*
        combative = MakeCharacter([MakeCombative], {
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        }, SentientEntity);
        */
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
});
