import mockEvents from "../../testHelpers/mockEvents";
import mockMap from "../../testHelpers/mockMap";
import { createMock } from "../../testHelpers/helpers";
import Entity from "../../../js/entities/character/Entity";
import { MakeCharacter } from "../../../js/entities/character/CharacterFactory";
import AI from "../../../js/ai/basic";
import SentientEntity from "../../../js/entities/character/SentientEntity";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
jest.mock('@/engine/js/entities/character.ts', () => createMock);
jest.mock('@/engine/js/ai/predator',  () => createMock);
jest.mock('@/engine/js/ai/basic', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {}),
        think: jest.fn()
    };
});

describe('Entity target', () => {

    let entityUnderTest: SentientEntity;
    let secondEntity: Entity;
    beforeEach(() => {
        entityUnderTest = MakeCharacter([], {
            ai: AI,
            position: {
                x: 0,
                y: 0
            }
        }, SentientEntity) as SentientEntity;
        secondEntity = new Entity({
            position: {
                x: 1,
                y: 1
            }
        });
    });

    it('should follow moving target', () => {
        expect(entityUnderTest.position.x).toEqual(0);
        entityUnderTest.ai.targetEntity = secondEntity;
        secondEntity.move(2);
        expect(entityUnderTest.target.x).toEqual(secondEntity.position.x);
        expect(entityUnderTest.target.y).toEqual(secondEntity.position.y);
    });
});
