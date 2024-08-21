import { expect } from '@jest/globals';
import { createMock } from '../../../../testHelpers/helpers';
import mockMap from '../../../../testHelpers/mockMap';
import AI from '../../../../../js/ai/basic';
import PlayableEntity from '../../../../../js/entities/character/PlayableEntity';
import Entity from '../../../../../js/entities/character/Entity';
import { Combative, MakeCombative } from '../../../../../js/entities/character/mixins/Combative';
import { EntityMixin, MakeCharacter } from '../../../../../js/entities/character/CharacterFactory';
import WorldCoordinate from '../../../../../js/coordinates/WorldCoordinate';

jest.mock('@/engine/js/entities/character.ts', () => createMock);
jest.mock('@/engine/js/ai/predator',  () => createMock);
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

describe('Combative.target', () => {

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

    it('should set to target entity', () => {
        expect(combative.position.x).toEqual(0);
        combative.target = secondEntity;
        expect(combative.target).toEqual(secondEntity);
    });

    it('should set to target position', () => {
        expect(combative.position.x).toEqual(0);
        const position = new WorldCoordinate(1, 1);
        combative.target = position;
        expect(combative.target).toEqual(position);
        expect(combative.targetPosition).toEqual(position);
    });

    it('should follow moving target', () => {
        expect(combative.position.x).toEqual(0);
        combative.target = secondEntity;
        secondEntity.move(2);
        expect(combative.target.x).toEqual(secondEntity.position.x);
        expect(combative.target.y).toEqual(secondEntity.position.y);
    });
});
