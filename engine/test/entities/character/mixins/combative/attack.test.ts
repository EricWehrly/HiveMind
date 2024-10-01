import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import { EntityMixin, MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../../js/entities/character/Entity";
import { Combative, MakeCombative } from "../../../../../js/entities/character/mixins/Combative";
import { Equipped, EquippedOptions, MakeEquipped } from "../../../../../js/entities/character/mixins/Equipped";
import Technology from "../../../../../js/technology";
import { TechnologyTypes } from "../../../../../js/TechnologyTypes";
import { LivingOptions, MakeLiving } from "../../../../../js/entities/character/mixins/Living";
import { MakePlayable, PlayableOptions } from "../../../../../js/entities/character/mixins/Playable";
import { SentientOptions } from "../../../../../js/entities/character/mixins/Sentient";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
// make defer fire immediately
jest.mock('@/engine/js/Loop.ts', () => ({
    ...jest.requireActual('@/engine/js/Loop.ts'),
    Defer: (callback: Function, ms: number) => callback(),
  }));

describe('Combative', () => {
    describe('attack', () => {
        describe('volume', () => {
            const options: EntityOptions & PlayableOptions = {
                name: 'Player',
                isPlayer: true
            }
            const localPlayer = MakeCharacter([MakePlayable], options);
            let attacker: Entity & Combative & Equipped;
            let target: Entity;
            const tech: Technology = new Technology({
                name: 'Test',
                type: TechnologyTypes.ATTACK
            });
            const playSoundSpy = jest.spyOn(tech, 'playSound');//.mockImplementation(() => {});

            function makeAttacker(distance: number) {
                const options: EntityOptions & SentientOptions & EquippedOptions = {
                    ai: null,
                    name: 'Reference',
                    position: {
                        x: distance,
                        y: 0
                    },
                    technologies: [
                        tech
                    ],
                    // range: 5
                }
                attacker = MakeCharacter([MakeEquipped, MakeCombative as EntityMixin], options);
            }
            function makeTarget(distance: number) {
                const options: EntityOptions & LivingOptions = {
                    name: 'targetEntity',
                    health: 100,
                    position: {
                        x: distance,
                        y: 0
                    }
                }
                target = MakeCharacter([MakeLiving, MakeCombative as EntityMixin], options);
            }
        
            it('should be 0 at distance 100', () => {
                const distance = 100;
                const targetVolume = 0;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.whyNotAttack(target)).toBe(null);
                attacker.attack(target);
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 100 at distance 0', () => {
                const distance = 0;
                const targetVolume = 100;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.whyNotAttack(target)).toBe(null);
                attacker.attack(target);
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 70 at distance 30', () => {
                const distance = 30;
                const targetVolume = 70;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.whyNotAttack(target)).toBe(null);
                attacker.attack(target);
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 90 at distance -10', () => {
                const distance = -10;
                const targetVolume = 90;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.whyNotAttack(target)).toBe(null);
                attacker.attack(target);
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        
            it('should be 0 at distance 103', () => {
                const distance = 100;
                const targetVolume = 0;
                makeAttacker(distance);
                makeTarget(distance);
                attacker.target = target;

                expect(attacker.whyNotAttack(target)).toBe(null);
                attacker.attack(target);
                
                expect(playSoundSpy).toHaveBeenCalledWith({ volume: targetVolume });
            });
        });        

    });
});
