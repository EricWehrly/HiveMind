import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import { EntityMixin, MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import Entity from "../../../../../js/entities/character/Entity";
import PlayableEntity from "../../../../../js/entities/character/PlayableEntity";
import { Combative, MakeCombative } from "../../../../../js/entities/character/mixins/Combative";
import { Equipped, MakeEquipped } from "../../../../../js/entities/character/mixins/Equipped";
import Technology from "../../../../../js/technology";
import { TechnologyTypes } from "../../../../../js/TechnologyTypes";
import { MakeLiving } from "../../../../../js/entities/character/mixins/Living";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/map.ts', () => mockMap);
// make defer fire immediately
jest.mock('@/engine/js/loop.mjs', () => ({
    ...jest.requireActual('@/engine/js/loop.mjs'),
    Defer: (callback: Function, ms: number) => callback(),
  }));

describe('Combative', () => {
    describe('attack', () => {
        describe('volume', () => {
            let localPlayer: PlayableEntity = MakeCharacter([], {
                name: 'Player'
            });
            let attacker: PlayableEntity & Combative & Equipped;
            let target: Entity;
            const tech: Technology = new Technology({
                name: 'Test',
                type: TechnologyTypes.ATTACK
            });
            const playSoundSpy = jest.spyOn(tech, 'playSound');//.mockImplementation(() => {});

            function makeAttacker(distance: number) {                
                attacker = MakeCharacter([MakeEquipped, MakeCombative as EntityMixin], {
                    ai: null,
                    name: 'Reference',
                    position: {
                        x: distance,
                        y: 0
                    },
                    technologies: [
                        tech
                    ],
                    range: 5
                });
            }
        
            it('should be 0 at distance 100', () => {
                PlayableEntity.LOCAL_PLAYER = localPlayer;
                const distance = 100;
                const targetVolume = 0;

                makeAttacker(distance);
                target = MakeCharacter([MakeLiving, MakeCombative as EntityMixin], {
                    name: 'targetEntity',
                    health: 100,
                    position: {
                        x: distance,
                        y: 0
                    }
                });
                attacker.target = target;
                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        });        

    });
});
