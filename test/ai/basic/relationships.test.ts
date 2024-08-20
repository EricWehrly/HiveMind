import mockMap from "../../testHelpers/mockMap";
import AI, { EntityRelationshipType } from "../../../js/ai/basic";
import SentientEntity from "../../../js/entities/character/SentientEntity";
import { CharacterDamagedEvent } from "../../../js/entities/character/mixins/Living";
import Entity from "../../../js/entities/character/Entity";

jest.mock('@/engine/js/mapping/map.ts', () => mockMap);
jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation(() => { }),
            List: new Proxy({}, {
                get: function (target, name) {
                    return name;
                },
                set: function (target, name, value) {
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

        const testCharacter = new SentientEntity({ name: 'testCharacter' });
        const testAI = new AI(testCharacter);
        
        describe('relationships', () => {

            it('should fear what hits it', () => {
                // give our entity-under-test something to fear (indirectly, because of method privacy)
                const secondEntity = new SentientEntity({ name: 'secondEntity' });
                hitEm(testAI, secondEntity);

                const relationship = testAI.relationship(secondEntity);

                expect(relationship.type).toBe(EntityRelationshipType.Afraid);
            });
        });
    });
});
