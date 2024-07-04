import Seed from '../../../js/core/seed.mjs';
import Map from '../../../js/mapping/map';
import SentientLivingEntity from '../../../js/entities/character/SentientLivingEntity';
import Biome, { BiomeType } from '../../../js/mapping/biome.mjs';

jest.mock('@/engine/js/events.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation(() => { }),
            List: new Proxy({}, {
                get: function(target, name) {
                    return name;
                },
                set: function(target, name, value) {
                    return true;  // Indicate that the assignment succeeded
                }
            })
        }
    };
});

jest.mock('@/engine/js/entities/character/SentientLivingEntity', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn(),
        isPlayer: true
    };
});

describe('map', () => {
    let map: Map;
    let mockCharacter: SentientLivingEntity;

    beforeEach(() => {
        map = new Map(new Seed());
        mockCharacter = new SentientLivingEntity({}); // replace with the actual constructor if it requires parameters
        mockCharacter.isPlayer = true;
        const biomeType = new BiomeType({
            name: 'test'
        });
        const mockBiome = new Biome({
            biomeType,
            width: 1,
            height: 1
        });
        jest.spyOn(map, 'getBiome').mockReturnValue(mockBiome);
        // mockCharacter.isPlayer = true;
    });

    describe('getChunk', () => {
        
        describe('private shouldMakeNewChunk', () => {

            /*
            it('should be false when character is not player and chunk not cached', () => {
                let chunkKeys = Object.keys(map.chunks);
                expect(chunkKeys).not.toContain('2,9');
                const result = map['shouldMakeNewChunk']('2,9');
                expect(result).toBe(false);
            })

            it('should be true for player character and non cached', () => {
                let chunkKeys = Object.keys(map.chunks);
                expect(chunkKeys).not.toContain('2,9');
                expect(mockCharacter.isPlayer).toBe(true);
                const result = map['shouldMakeNewChunk']('2,9', mockCharacter);
                expect(result).toBe(true);
            })
                */

            /*
            it('should be false for player character and cached', () => {

                expect(mockCharacter.isPlayer).toBe(true);
                const GRID_SIZE = 25;
                map.getChunk({ x: 2 * GRID_SIZE, y: 9 * GRID_SIZE, character: mockCharacter });
                let chunkKeys = Object.keys(map.chunks);
                expect(chunkKeys).toContain('2,9');
                const result = map['shouldMakeNewChunk']('2,9', mockCharacter);
                expect(result).toBe(false);
            })
                */
        });

        /*
        // TODO: should probably be less than limit and not cached
        it('should make a new chunk if initiated by a player, and not cached', () => {

            const mapChunkCount = Object.keys(map.chunks).length;
            expect(mapChunkCount).toBe(0);
            
            // this is a bad hack
            const GRID_SIZE = 25;
            map.getChunk({ x: 3 * GRID_SIZE, y: 4 * GRID_SIZE, character: mockCharacter });

            const chunkKeys = Object.keys(map.chunks);
            expect(chunkKeys).toContain('3,4');
        });
        */

        it('should retrieve chunks from cache', () => {
            // TODO: assert that constructor was not called
        });
    });
});