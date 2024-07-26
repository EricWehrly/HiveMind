import mockMap from "../../testHelpers/mockMap";
import AI from "../../../js/ai/basic";
import SentientEntity from "../../../js/entities/character/SentientEntity";

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

describe('AI', () => {
    describe('basic', () => {

        const testCharacter = new SentientEntity({name: 'testCharacter'});
        let testAI: AI;

        beforeEach(() => {
            testAI = new AI(testCharacter);
        });

        describe('wander', () => {
            it('should pick a new target', () => {

                const oldPerformance = performance.now;
                // MS_BETWEEN_WANDER_DESTINATIONS = 30000; currently hardcoded and externally inaccessible
                performance.now = jest.fn(() => 30001);

                expect(testCharacter.targetPosition).toBeNull();
                testAI.wander();
                expect(testCharacter.targetPosition).not.toBeNull();

                expect(testCharacter.targetPosition.x).not.toEqual(0);
                expect(testCharacter.targetPosition.y).not.toEqual(0);
                expect(testCharacter.targetPosition.x).not.toEqual(testCharacter.position.x);
                expect(testCharacter.targetPosition.y).not.toEqual(testCharacter.position.y);

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
    });
});