import mockEvents from "../../testHelpers/mockEvents";
import Point from "../../../js/coordinates/point";
import Chunk from "../../../js/mapping/chunk";

jest.mock('@/engine/js/events', () => mockEvents);

describe('chunk', function() {
    describe('getChunkCoordinate', function() {
        it('should return 0,0 for small numbers', function() {
            const input = new Point(5, 5);
            const expected = new Point(0, 0);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });

        it('should handle negative X', function() {
            const input = new Point(-5, 5);
            const expected = new Point(-1, 0);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });

        it('should handle negative Y', function() {
            const input = new Point(5, -5);
            const expected = new Point(0, -1);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });

        it('should handle negative X and Y', function() {
            const input = new Point(-5, -5);
            const expected = new Point(-1, -1);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });

        // by 'multiple' we mean 'chunks past 0,0 or 1,1'
        // ... need better words for that
        it('should calculate multiple chunk distance', function() {
            const input = new Point(60, 76);
            const expected = new Point(2, 3);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });

        it('should handle multiple negatives', function() {
            const input = new Point(-55, 5);
            const expected = new Point(-3, 0);
            const coordinate = Chunk.getChunkCoordinate(input);
            expect(coordinate.x).toBe(expected.x);
            expect(coordinate.y).toBe(expected.y);
        });
    });
});
