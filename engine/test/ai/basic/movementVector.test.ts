import mockMap from "../../testHelpers/mockMap";
import AI from "../../../js/ai/basic";
import SentientEntity from "../../../js/entities/character/SentientEntity";
import { CharacterDamagedEvent } from "../../../js/entities/character/mixins/Living";
import Entity from "../../../js/entities/character/Entity";
import WorldCoordinate from "../../../js/coordinates/WorldCoordinate";

jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
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

function hitEm(ai: AI, attacker: Entity) {
    const damagedEvent: CharacterDamagedEvent = {
        id: null,
        attacker: attacker,
        amount: 1,
        character: ai.character
    };
    ai.onCharacterDamaged(damagedEvent);
}

describe('AI', () => {
    describe('basic', () => {

        const testCharacter = new SentientEntity({name: 'testCharacter'});
        let testAI = new AI(testCharacter);

        beforeEach(() => {
            testAI = new AI(testCharacter);
            // @ts-expect-error
            testAI['#lastDestinationPickedTime'] = 0;
            // testAI['#lastDestinationPickedTime'] = performance.now() - (30000 / 2);
        });

        describe('_desiredMovementVector', () => {
            it('should (actually fail this and do something different)', () => {
                const vector = testAI._desiredMovementVector;
                expect(vector).not.toBeNull();
                expect(vector.x).toBe(0);
                expect(vector.y).toBe(0);
            });

            // toward entity it likes

            // toward entity it wants to hit (predator ai, not basic)

            it('should move away from an entity it fears', () => {
                // give our entity-under-test something to fear (indirectly, because of method privacy)
                const secondEntity = new SentientEntity({});
                hitEm(testAI, secondEntity);
                secondEntity.position = new WorldCoordinate(2, 0);
                testCharacter.position = new WorldCoordinate(1, 0);

                const vector = testAI._desiredMovementVector;
                expect(vector).not.toBeNull();
                expect(vector.x).toBe(-1);
                expect(vector.y).toBe(0);
            });

            it('should move away perpendicular to two feared entities', () => {
                // give our entity-under-test something to fear (indirectly, because of method privacy)
                const leftEntity = new SentientEntity({
                    position: { x: -5, y: 0 }
                });
                const topEntity = new SentientEntity({
                    position: { x: -4, y: -1 }
                });
                hitEm(testAI, leftEntity);
                hitEm(testAI, topEntity);
                testCharacter.position = new WorldCoordinate(-4, 0);

                const vector = testAI._desiredMovementVector;
                expect(vector).not.toBeNull();
                expect(vector.x).toBeCloseTo(0.707);
                expect(vector.y).toBeCloseTo(0.707);
                // we could also multiply the numbers and 
            });
        });
    });
});
