import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import HiveMindCharacter from "../../../../../../js/entities/character/HiveMindCharacter";
import { MakeHiveMindCharacter } from "../../../../../../js/entities/character/HivemindCharacterFactory";
import AI from "../../../../../js/ai/basic";
import { MakeSentient, Sentient } from "../../../../../js/entities/character/mixins/Sentient";

let mockCalled = false;

jest.mock('@/engine/js/events', () => mockEvents);
class mockAI extends AI {
    think = jest.fn().mockImplementation(() => { 
        mockCalled = true;
    });
}

jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Sentient.think', () => {

    it('will call think if it has ai', () => {
        
        const sentientEntity = MakeHiveMindCharacter([MakeSentient], {
            ai: mockAI
        }) as HiveMindCharacter & Sentient;
        expect(sentientEntity.ai).toBeDefined();
        sentientEntity.ai.think(0);
        expect(mockCalled).toBe(true);
    });

    it('no ai, no problems', () => {

        const sentientEntity = MakeHiveMindCharacter([MakeSentient], {
            // ai: null
        }) as HiveMindCharacter & Sentient;

        expect(sentientEntity.ai).toBeDefined();
        try {
            sentientEntity.ai.think(0);
        } catch (ex) {
            // fail the test if this is hit
            console.error(ex);
            expect(true).toBe(false);
        }
    });

    // null means no
});
