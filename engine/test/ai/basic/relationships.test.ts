import mockMap from "../../testHelpers/mockMap";
import AI from "../../../js/ai/basic";
import { CharacterDamagedEvent } from "../../../js/entities/character/mixins/Living";
import Entity from "../../../js/entities/character/Entity";
import { MakeSentient } from "../../../js/entities/character/mixins/Sentient";
import { MakeCharacter } from "../../../js/entities/character/CharacterFactory";
import { EntityRelationshipType } from "../../../js/behavior/EntityRelationship";

jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
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
        attacker: attacker,
        amount: 1,
        character: ai.character
    };
    ai.onCharacterDamaged(damagedEvent);
}

describe('AI', () => {
    describe('basic', () => {

        const testCharacter = MakeCharacter([MakeSentient], { name: 'testCharacter' });
        const testAI = new AI(testCharacter);
        
        describe('relationships', () => {

            it('should fear what hits it', () => {
                // give our entity-under-test something to fear (indirectly, because of method privacy)
                const secondEntity = MakeCharacter([MakeSentient], { name: 'secondEntity' });
                hitEm(testAI, secondEntity);

                const relationship = testAI.getRelationship(secondEntity);

                expect(relationship.type).toBe(EntityRelationshipType.Afraid);
            });
        });
    });
});
