import { expect } from '@jest/globals';
import mockEvents from '../../../../testHelpers/mockEvents';
import { createMock } from '../../../../testHelpers/helpers';
import mockMap from '../../../../testHelpers/mockMap';
import AI from '../../../../../js/ai/basic';
import Entity from '../../../../../js/entities/character/Entity';
import { MakeCharacter } from '../../../../../js/entities/character/CharacterFactory';
import { MakeSentient, Sentient, SentientOptions } from '../../../../../js/entities/character/mixins/Sentient';
import { EntityOptions } from '../../../../../js/entities/character/EntityOptions';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
// https://stackoverflow.com/a/54475733/5450892
jest.mock('@/engine/js/entities/character.ts', () => createMock);
jest.mock('@/engine/js/ai/predator',  () => createMock);

describe('Combative.move', () => {

    // TODO: This needs to be PlayableEntity for the afterMove reference,
    // which we can remove to downgrade the entity type
    let sentientEntity_underTest: Entity & Sentient;
    let secondEntity: Entity;
    beforeEach(() => {
        const options: EntityOptions & SentientOptions = {
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        }
        sentientEntity_underTest = MakeCharacter([MakeSentient], options) as Entity & Sentient;
        secondEntity = MakeCharacter([], {
            position: {
                x: 2,
                y: 2
            }
        });
    });

    it('should move toward target', () => {
        const moveAmount = 1;
        expect(sentientEntity_underTest.position.x).toEqual(0);
        sentientEntity_underTest.ai.targetEntity = secondEntity;
        sentientEntity_underTest.ai.think(0);
        sentientEntity_underTest.move(1);
        // later, we need to change this to be fractional
        expect(sentientEntity_underTest.position.x).toEqual(1);
        expect(sentientEntity_underTest.position.y).toEqual(1);
    });

    it('should not move past target', () => {
        const moveAmount = (secondEntity.position.x - sentientEntity_underTest.position.x) * 5
        expect(sentientEntity_underTest.position.x).toEqual(0);
        sentientEntity_underTest.ai.targetEntity = secondEntity;
        sentientEntity_underTest.ai.think(0);
        sentientEntity_underTest.move(5);
        expect(sentientEntity_underTest.position.x).toBeLessThan(secondEntity.position.x + 1);
        expect(sentientEntity_underTest.position.x).toBeGreaterThanOrEqual(secondEntity.position.x);
    });

    it('should call super move if not moving to target', () => {
        sentientEntity_underTest.ai.targetEntity = null;
        const spy = jest.spyOn(Entity.prototype, 'move');

        sentientEntity_underTest.ai.think(0);
        sentientEntity_underTest.move(1);
    
        expect(spy).toHaveBeenCalled();
    
        spy.mockRestore();
    });
});
