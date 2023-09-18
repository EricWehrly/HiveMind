import Chunk from "./chunk.mjs";

function expectCoordinate(input, expected) {

    const coordinate = Chunk.getChunkCoordinate(input.x, input.y);
    
    if(coordinate.x != expected.x) {
        console.error(`Expected X of ${coordinate.x} to match ${expected.x} for input ${input.x}`);
        return false;
    }
        
    if(coordinate.y != expected.y) {
        console.error(`Expected Y of ${coordinate.y} to match ${expected.y} for input ${inputy.y}`);
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
    },

    negativeXAndY: function() {
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

    negativeDistance: function() {
    },
}

tests.gets00ForSmallNumbers();

tests.negativeX();

tests.multipleChunkDistance();
