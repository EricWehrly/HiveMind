import { mockEvents, raisedEvents, resetTrackedEvents } from '../../../testHelpers/mockEvents';
import mockMap from '../../../testHelpers/mockMap';
import Vector from '../../../../js/baseTypes/Vector';
import { MakeCharacter } from '../../../../js/entities/character/CharacterFactory';
import { MakePlayable, Playable, PlayableOptions } from '../../../../js/entities/character/mixins/Playable';
import Entity, { EntityOptions } from '../../../../js/entities/character/Entity';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});

// move to mixin
describe('Playable.move', () => {
    
    let entity: Entity & Playable;

    beforeEach(() => {
        const options: EntityOptions & PlayableOptions = {
            isPlayer: true,
            position: {
                x: 1,
                y: 1
            }
        }
        entity = MakeCharacter([MakePlayable], options) as Entity & Playable;
        entity.desiredMovementVector = new Vector(1, 1);
        entity.isPlayer = true;

        resetTrackedEvents();
    });

    it('should notify events when player position changes', () => {

        // TODO: second test for lastPosition is null?
        // line up "lastPosition"
        entity.move(1);
        // expect(Events.default.RaiseEvent).not.toHaveBeenCalledWith('PlayerMoved');
        expect(raisedEvents).toContain('PlayerMoved');
        expect(raisedEvents).toContain('PlayerChunkChanged');
        expect(raisedEvents.length).toBe(2);
    });

    it('should not notify events when player position is unchanged', () => {
        entity.move(0);
        expect(raisedEvents).not.toContain('PlayerMoved');
    });
});
