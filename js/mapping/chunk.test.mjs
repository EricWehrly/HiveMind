import Chunk from "./chunk.ts";

function expectCoordinate(input, expected) {

    const coordinate = Chunk.getChunkCoordinate(input.x, input.y);
    
    if(coordinate.x != expected.x) {
        console.error(`Expected X of ${coordinate.x} to match ${expected.x} for input ${input.x}`);
        return false;
    }
        
    if(coordinate.y != expected.y) {
        console.error(`Expected Y of ${coordinate.y} to match ${expected.y} for input ${input.y}`);
        return false;
    }
}

const tests = {

    gets00ForSmallNumbers: function() {

        console.log(`Starting gets00ForSmallNumbers`);
    
        const input = {
            x: 5,
            y: 5
        };
        const expected = {
            x: 0,
            y: 0
        }
        expectCoordinate(input, expected);
    },

    negativeX: function() {

        console.log(`Starting negativeX`);
        
        const input = {
            x: -5,
            y: 5
        };
        const expected = {
            x: -1,
            y: 0
        }
        expectCoordinate(input, expected);
    },

    negativeY: function() {

        console.log(`Starting negativeY`);
        
        const input = {
            x: 5,
            y: -5
        };
        const expected = {
            x: 0,
            y: -1
        }
        expectCoordinate(input, expected);
    },

    negativeXAndY: function() {

        console.log(`Starting negativeXAndY`);
        
        const input = {
            x: -5,
            y: -5
        };
        const expected = {
            x: -1,
            y: -1
        }
        expectCoordinate(input, expected);
    },

    multipleChunkDistance: function() {

        console.log(`Starting multipleChunkDistance`);
        
        const input = {
            x: 60,
            y: 76
        };
        const expected = {
            x: 2,
            y: 3
        }
        expectCoordinate(input, expected);
    },

    multipleNegative: function() {

        console.log(`Starting multipleNegative`);
        
        const input = {
            x: -55,
            y: 5
        };
        const expected = {
            x: -3,
            y: 0
        }
        expectCoordinate(input, expected);
    },
}

tests.gets00ForSmallNumbers();

tests.negativeX();

tests.negativeY();

tests.negativeXAndY();

tests.multipleChunkDistance();

tests.multipleNegative();
