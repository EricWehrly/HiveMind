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
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
// make defer fire immediately
jest.mock('@/engine/js/loop.mjs', () => ({
    ...jest.requireActual('@/engine/js/loop.mjs'),
    Defer: (callback: Function, ms: number) => callback(),
  }));

describe('Combative', () => {
    describe('attack', () => {
        describe('volume', () => {
            PlayableEntity.LOCAL_PLAYER = MakeCharacter([], {
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
            function makeTarget(distance: number) {
                target = MakeCharacter([MakeLiving, MakeCombative as EntityMixin], {
                    name: 'targetEntity',
                    health: 100,
                    position: {
                        x: distance,
                        y: 0
                    }
                });
            }
        
            it('should be 0 at distance 100', () => {
                const distance = 100;
                const targetVolume = 0;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 100 at distance 0', () => {
                const distance = 0;
                const targetVolume = 100;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 70 at distance 30', () => {
                const distance = 30;
                const targetVolume = 70;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 90 at distance -10', () => {
                const distance = -10;
                const targetVolume = 90;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 0 at distance 103', () => {
                const distance = 100;
                const targetVolume = 0;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.canAttack()).toBe(true);
                attacker.attack();
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        });        

    });
});
