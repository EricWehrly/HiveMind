import { describe, it } from 'node:test';
import assert from "node:assert/strict";
import BlackoutMap from '../../js/util/blackout-map.mjs';

// to run this, probably run
// node --test
describe('over here right now', () => {

    it('defaults to false', () => {

        const map = new BlackoutMap();

        assert.equal(map.isBlocked(1, 1), false);
    });

    it('marks added areas as blocked', () => {

        const map = new BlackoutMap();

        map.add({
            x: 0,
            y: 0,
            width: 1,
            height: 1
        });

        assert.equal(map.isBlocked(1, 1), true);
    });

    it('takes constructor arguments', () => {

        const areas = [
            {
                x: 0,
                y: 0,
                width: 2,
                height: 2
            }
        ];
        const map = new BlackoutMap(areas);

        assert.equal(map.isBlocked(1, 1), true);
    });

    // records multiple separate areas

    // gap between areas
});
