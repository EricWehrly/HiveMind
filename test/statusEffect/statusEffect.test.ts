import mockEvents from '../testHelpers/mockEvents';
import mockMap from '../testHelpers/mockMap';
import StatusEffect, { StatusEffectCallbackOptions, StatusEffectOptions } from '../../js/StatusEffect';
import { MakeCharacter } from '../../js/entities/character/CharacterFactory';
import Entity from '../../js/entities/character/Entity';
import { Defer } from '../../js/Loop';
import { Living, LivingOptions, MakeLiving } from '../../js/entities/character/mixins/Living';

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
jest.mock('@/engine/js/Loop.ts', () => ({
    Defer: jest.fn(),
    RegisterLoopMethod: jest.fn(),
}));

jest.useFakeTimers();

describe('StatusEffect', () => {
    let statusEffectUnderTest: StatusEffect;
    let target: Entity;
    const statusEffectOptions: StatusEffectOptions = {
        name: 'testEffect',
        interval: 250
    };

    beforeEach(() => {
        statusEffectUnderTest = new StatusEffect(statusEffectOptions);
        target = MakeCharacter([], null);
        
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // should prevent an interval of 0 (each constructor & setter)

    it('should apply effect to target with proper duration', (done) => {
        const duration = 1000;
        statusEffectUnderTest.apply(target, duration);

        const appliedEffects = StatusEffect.GetEffectsForEntity(target);
        expect(appliedEffects.length).toBe(1);
        expect(appliedEffects[0].statusEffect).toBe(statusEffectUnderTest);
        expect(appliedEffects[0].duration).toBe(duration);
        done();
    });

    it('should register callback deferral when applying', (done) => {

        const duration = 1000;

        expect(Defer).not.toHaveBeenCalled();
        statusEffectUnderTest.apply(target, duration);

        expect(Defer).toHaveBeenCalledWith(expect.any(Function), statusEffectUnderTest.interval + 1);
        done();        
    });

    describe('callback', () => {
        it('should register deferred callback ', () => {
            
            const duration = 1000;
            const startTime = performance.now() - 900;
            const callbackOptions: StatusEffectCallbackOptions = {
                startTime,
                lastInterval: 0,
                target,
                duration
            };
            statusEffectUnderTest.apply(target, duration);
            jest.clearAllMocks();
            statusEffectUnderTest.callback(callbackOptions);
    
            expect(Defer).toHaveBeenCalledWith(expect.any(Function), statusEffectUnderTest.interval + 1);
        });
    
        it('should stop deferring when the effect is meant to end', () => {
            
            statusEffectUnderTest.interval = 700;
            
            const duration = 1000;
            const callbackOptions: StatusEffectCallbackOptions = {
                startTime: performance.now() - 1001,
                lastInterval: 1,
                target,
                duration
            };
            expect(Defer).not.toHaveBeenCalled();
            statusEffectUnderTest.callback(callbackOptions);
    
            expect(Defer).not.toHaveBeenCalled();
        });

        it('should fire any missed intervals upon completion', () => {
            // if enough time has elapsed, we should expect that the internal 'intervalmethod' gets called enough times
            // right now, that's a private method that applies damage, so we can test against that
            const damageStatusEffect = new StatusEffect({
                name: 'testWithDamage',
                damage: 3,
                interval: 100
            });
            const livingOptions: LivingOptions = {
                maxHealth: 100,
                health: 100
            }
            const duration = 1000;
            const expectedIntervalCount = Math.floor(duration / damageStatusEffect.interval);
            const expectedDamage = damageStatusEffect.damage * expectedIntervalCount;
            const expectedHealth = livingOptions.health - expectedDamage;

            const livingEntity = MakeCharacter([MakeLiving], livingOptions) as Entity & Living;
            expect(livingEntity.health).toBe(livingOptions.health);
            damageStatusEffect.apply(livingEntity, duration);
            expect(livingEntity.health).toBe(livingOptions.health);
            
            const callbackOptions: StatusEffectCallbackOptions = {
                startTime: performance.now() - 1000,
                lastInterval: 0,
                duration: 1000,
                target: livingEntity
            }

            jest.advanceTimersByTime(1000);
            damageStatusEffect.callback(callbackOptions);

            expect(livingEntity.health).toBe(expectedHealth);
        });

        it('should update remaining duration', () => {
            const duration = 1000;
            const callbackOptions: StatusEffectCallbackOptions = {
                startTime: performance.now(),
                lastInterval: 1,
                target,
                duration
            };
            statusEffectUnderTest.apply(target, duration);
            
            jest.advanceTimersByTime(duration / 2);
            statusEffectUnderTest.callback(callbackOptions);
    
            const effect = StatusEffect.GetEffectForEntity(target, statusEffectUnderTest);
            expect(effect.duration).toBe(duration / 2);
        });

        it('should report 0 duration after time has elapsed', () => {
            const duration = 1000;
            const callbackOptions: StatusEffectCallbackOptions = {
                startTime: performance.now(),
                lastInterval: 1,
                target,
                duration
            };
            statusEffectUnderTest.apply(target, duration);
            
            jest.advanceTimersByTime(duration * 2);
            statusEffectUnderTest.callback(callbackOptions);
            
            const effect = StatusEffect.GetEffectForEntity(target, statusEffectUnderTest);
            expect(effect.duration).toBe(0);
        });
    });
});
