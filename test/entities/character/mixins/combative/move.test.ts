import { expect } from '@jest/globals';
import mockEvents from '../../../../testHelpers/mockEvents';
import { createMock } from '../../../../testHelpers/helpers';
import mockMap from '../../../../testHelpers/mockMap';
import AI from '../../../../../js/ai/basic';
import PlayableEntity from '../../../../../js/entities/character/PlayableEntity';
import Entity from '../../../../../js/entities/character/Entity';
import { Combative, MakeCombative } from '../../../../../js/entities/character/mixins/Combative';
import { EntityMixin, MakeCharacter } from '../../../../../js/entities/character/CharacterFactory';
import SentientEntity from '../../../../../js/entities/character/SentientEntity';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
// https://stackoverflow.com/a/54475733/5450892
jest.mock('@/engine/js/entities/character.ts', () => createMock);
jest.mock('@/engine/js/ai/predator',  () => createMock);
/*
jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});
*/

describe('Combative.move', () => {

    // TODO: This needs to be PlayableEntity for the afterMove reference,
    // which we can remove to downgrade the entity type
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
        combative.ai.think();
        combative.move(2);
        expect(combative.position.x).toEqual(1);
    });

    it('should not move past target', () => {
        expect(combative.position.x).toEqual(0);
        combative.target = secondEntity;
        combative.ai.think();
        combative.move(5);
        expect(combative.position.x).toEqual(1);
    });

    it('should call afterMove if moving to target', () => {
        combative.target = secondEntity;
        const spy = jest.spyOn(PlayableEntity.prototype, 'afterMove');

        expect(combative.position.x).toEqual(0);
        combative.ai.think();
        combative.move(2);
        expect(combative.position.x).toEqual(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });

    it('should call super move if not moving to target', () => {
        combative.target = null;
        const spy = jest.spyOn(PlayableEntity.prototype, 'move');

        combative.ai.think();
        combative.move(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });
});
