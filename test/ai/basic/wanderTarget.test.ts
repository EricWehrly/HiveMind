import mockEvents from "../../testHelpers/mockEvents";
import mockMap from "../../testHelpers/mockMap";
import AI from "../../../js/ai/basic";
import SentientEntity from "../../../js/entities/character/SentientEntity";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('basic ai wander', () => {

    const testCharacter = new SentientEntity({ name: 'testCharacter' });
    let testAI: AI;

    beforeEach(() => {
        testAI = new AI(testCharacter);
    });

    it('should pick a new target', () => {

        const oldPerformance = performance.now;
        // MS_BETWEEN_WANDER_DESTINATIONS = 30000; currently hardcoded and externally inaccessible
        performance.now = jest.fn(() => 30001);

        expect(testAI.targetPosition).toBeUndefined();
        testAI.wander();
        expect(testAI.targetPosition).toBeDefined();

        expect(testAI.targetPosition.x).not.toEqual(0);
        expect(testAI.targetPosition.y).not.toEqual(0);
        expect(testAI.targetPosition.x).not.toEqual(testCharacter.position.x);
        expect(testAI.targetPosition.y).not.toEqual(testCharacter.position.y);

        performance.now = oldPerformance;
    });

    it('should limit its wandering frequency', () => {
        // TODO
    });

    it('should avoid entities that it is afraid of', () => {
        // TODO
    });

    // when following entity
    // should not pick a new target 
    // (this tests the first line of 'wander')
});
