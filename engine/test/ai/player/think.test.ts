import mockEvents from "../../testHelpers/mockEvents";
import mockMap from "../../testHelpers/mockMap";
import { createMock } from "../../testHelpers/helpers";
import Entity from "../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../js/entities/character/CharacterFactory";
import PlayerAI from "../../../js/ai/Player";
import { MakeEquipped } from "../../../js/entities/character/mixins/Equipped";
import { MakeSentient, Sentient, SentientOptions } from "../../../js/entities/character/mixins/Sentient";
import { Playable, PlayableOptions } from "../../../js/entities/character/mixins/Playable";
import { EntityOptions } from "../../../js/entities/character/EntityOptions";

// https://stackoverflow.com/a/54475733/5450892
jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap', () => mockMap);
jest.mock('@/engine/js/coordinates/point', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((x, y) => {})
    }
});
jest.mock('@/engine/js/entities/character', () => createMock);
// jest.mock('@/engine/js/ai/basic',  () => createMock);

// TODO: these should have nothing to do with combatant / combative once we extract sentient

describe('Player.think', () => {

    let entityUnderTest: Entity & Sentient & Playable;
    let secondEntity: Entity;
    beforeEach(() => {
        const options: EntityOptions & SentientOptions & PlayableOptions = {
            ai: PlayerAI,
            isPlayer: true            
        }
        entityUnderTest = MakeCharacter([MakeEquipped, MakeSentient], options) as Entity & Sentient & Playable;
        secondEntity = MakeCharacter([], {});
    });
    
    Entity.prototype.getClosestEntity = jest.fn().mockImplementation((options) => {
        return secondEntity;
    });

    // only this test needs the player to be equipped (MakeEquipped)
    // because the target requires the "attack range" of the entity as a shortcut
    // in reality, we have no scenarios for a player with no equipment
    it('if player, sets target to closest entity', () => {

        expect(entityUnderTest.target).toBe(undefined);

        entityUnderTest.isPlayer = true;

        entityUnderTest.ai.think(0);

        expect(entityUnderTest.target).toBe(secondEntity);
    });
});
