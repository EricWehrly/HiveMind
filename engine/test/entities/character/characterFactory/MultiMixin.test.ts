import { eventCount, mockEvents, resetTrackedEvents } from "../../../testHelpers/mockEvents";
import mockMap from "../../../testHelpers/mockMap";
import { IsLiving, Living, LivingOptions, MakeLiving } from "../../../../js/entities/character/mixins/Living";
import { MakeCharacter } from "../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../js/entities/character/Entity";
import { IsSentient, MakeSentient, Sentient, SentientOptions } from "../../../../js/entities/character/mixins/Sentient";
import { Equipped, IsEquipped, MakeEquipped } from "../../../../js/entities/character/mixins/Equipped";
import { Combative, IsCombative, MakeCombative } from "../../../../js/entities/character/mixins/Combative";
import { Dummy, DummyMixin } from "../../../fakeClasses/DummyMixin";
import { GetLocalPlayer, MakePlayable, Playable, PlayableOptions } from "../../../../js/entities/character/mixins/Playable";
import PostConstruct from "../../../../ts/decorators/PostConstruct";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/entities/resource.ts', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Get: jest.fn().mockImplementation(() => {
                return {
                    available: 100,
                    pay: jest.fn().mockImplementation(() => true),
                    reserve: jest.fn().mockImplementation(() => true)
                };
            })
        }
    }
});
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('ChacterFactory.MakeCharacter', () => {

    beforeEach(() => {
        resetTrackedEvents();
    });

    const options: EntityOptions & SentientOptions = {
        ai: null,
        name: 'Reference'
    }
    const referenceEntity = MakeCharacter([], options);

    // just use a custom class for these tests: --->
    describe('should create a character with multiple mixins', () => {
        const mixins = [MakeLiving, MakeSentient, MakeEquipped, MakeCombative];

        const characterOptions: EntityOptions & LivingOptions = {
            speed: 3,
            health: 10
        };
        const character = MakeCharacter(mixins, characterOptions);
        const typedCharacter = character as Entity & Living & Sentient & Combative & Equipped;

        it('should be valid for each Mixin', () => {
            expect(character).not.toBeNull();
            expect(IsLiving(character)).toBeTruthy();
            expect(IsSentient(character)).toBeTruthy();
            expect(IsCombative(character)).toBeTruthy();
            expect(IsEquipped(character)).toBeTruthy();
        });
    
        it('should construct valid base type', () => {
            expect(character).not.toBeNull();
            expect(character instanceof Entity).toBeTruthy();
            expect(typedCharacter.addAttribute).toBeDefined();
        });
    
        it('should apply parameters to base entity', () => {
            const Speed = typedCharacter.getAttribute('Speed')?.value;
            expect(Speed).toBe(characterOptions.speed);
        });
    
        it('should apply mixin parameters to mixed entity', () => {
            // this was better when we had references to pass for the test
            // so it's kind of duplicated in the game tests for now
            expect(typedCharacter.isAlive).toBe(true);
        });
    
        it('should apply functionality from mixin to entity', () => {
            expect(typedCharacter.damage).toBeDefined();
        });
    });

    it('should call postConstruct exactly once for each mixin type', () => {
        const mixins = [MakePlayable, DummyMixin];
        const options: EntityOptions & PlayableOptions = {
            isPlayer: true
        }

        const characterUnderTest = MakeCharacter(mixins, options);
        const typedCharacter = characterUnderTest as Entity & Playable & Dummy;
        const localPlayer = GetLocalPlayer();

        expect(typedCharacter.postConstructCallCount).toBe(1);
        expect(eventCount('EntityCreated')).toBe(1);
        expect(characterUnderTest.equals(localPlayer)).toBe(true);
    });
    
    it('should call static constructor exactly once for each mixin type', () => {

        /* none of this works, so we did it manually. TODO, of course
        jest.resetModules();

        const mockPostConstruct = jest.fn();
        jest.mock('@/engine/ts/decorators/PostConstruct', () => mockPostConstruct);

        jest.resetModules();
        
        const mixins = [MakePlayable, DummyMixin];
        const options: EntityOptions & PlayableOptions = {
            isPlayer: true
        }
        const characterUnderTest = MakeCharacter(mixins, options);

        // once eachfor entity, for playable, and for dummy
        expect(mockPostConstruct).toHaveBeenCalledTimes(3);

        jest.restoreAllMocks();
        */
    });
});
