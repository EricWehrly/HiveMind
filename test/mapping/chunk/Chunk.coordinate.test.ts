import mockEvents from "../../testHelpers/mockEvents";
import Point from "../../../js/coordinates/point";
import Chunk from "../../../js/mapping/chunk";

jest.mock('@/engine/js/events', () => mockEvents);

describe('chunk', function() {
    describe('getWorldCoordinate', function() {

        it('should convert chunk to world and back', () => {

            const startingWorldPosition = new Point(30, 30);
            const expectedChunk = new Point(1, 1);
            const expectedWorld = new Point(
                expectedChunk.x * Chunk.CHUNK_SIZE, 
                expectedChunk.y * Chunk.CHUNK_SIZE);

            const chunkCoord = Chunk.getChunkCoordinate(startingWorldPosition);
            expect(chunkCoord.x).toBe(expectedChunk.x);
            expect(chunkCoord.y).toBe(expectedChunk.y);

            const worldCoord = Chunk.getWorldCoordinate(chunkCoord);
            expect(worldCoord.x).toBe(expectedWorld.x);
            expect(worldCoord.y).toBe(expectedWorld.y);

            const chunkCoord2 = Chunk.getChunkCoordinate(worldCoord);
            expect(chunkCoord2.x).toBe(expectedChunk.x);
            expect(chunkCoord2.y).toBe(expectedChunk.y);
        });

        it('should convert in negative quadrants', () => {

            const startingWorldPosition = new Point(-30, -30);
            const expectedChunk = new Point(-2, -2);
            const expectedWorld = new Point(
                (expectedChunk.x) * Chunk.CHUNK_SIZE,
                (expectedChunk.y) * Chunk.CHUNK_SIZE);

            const chunkCoord = Chunk.getChunkCoordinate(startingWorldPosition);
            expect(chunkCoord.x).toBe(expectedChunk.x);
            expect(chunkCoord.y).toBe(expectedChunk.y);

            const worldCoord = Chunk.getWorldCoordinate(chunkCoord);
            expect(worldCoord.x).toBe(expectedWorld.x);
            expect(worldCoord.y).toBe(expectedWorld.y);

            const chunkCoord2 = Chunk.getChunkCoordinate(worldCoord);
            expect(chunkCoord2.x).toBe(expectedChunk.x);
            expect(chunkCoord2.y).toBe(expectedChunk.y);
        });

        it('high positive numbers', () => {

            const startingWorldPosition = new Point(315, 315);
            const expectedChunk = new Point(12, 12);
            const expectedWorld = new Point(
                expectedChunk.x * Chunk.CHUNK_SIZE,
                expectedChunk.y * Chunk.CHUNK_SIZE);

            const chunkCoord = Chunk.getChunkCoordinate(startingWorldPosition);
            expect(chunkCoord.x).toBe(expectedChunk.x);
            expect(chunkCoord.y).toBe(expectedChunk.y);

            const worldCoord = Chunk.getWorldCoordinate(chunkCoord);
            expect(worldCoord.x).toBe(expectedWorld.x);
            expect(worldCoord.y).toBe(expectedWorld.y);

            const chunkCoord2 = Chunk.getChunkCoordinate(worldCoord);
            expect(chunkCoord2.x).toBe(expectedChunk.x);
            expect(chunkCoord2.y).toBe(expectedChunk.y);
        });

        it('low negative numbers', () => {

            const startingWorldPosition = new Point(-315, -315);
            const expectedChunk = new Point(-13, -13);
            const expectedWorld = new Point(
                expectedChunk.x * Chunk.CHUNK_SIZE,
                expectedChunk.y * Chunk.CHUNK_SIZE);

            const chunkCoord = Chunk.getChunkCoordinate(startingWorldPosition);
            expect(chunkCoord.x).toBe(expectedChunk.x);
            expect(chunkCoord.y).toBe(expectedChunk.y);

            const worldCoord = Chunk.getWorldCoordinate(chunkCoord);
            expect(worldCoord.x).toBe(expectedWorld.x);
            expect(worldCoord.y).toBe(expectedWorld.y);

            const chunkCoord2 = Chunk.getChunkCoordinate(worldCoord);
            expect(chunkCoord2.x).toBe(expectedChunk.x);
            expect(chunkCoord2.y).toBe(expectedChunk.y);
        });
    });
});
