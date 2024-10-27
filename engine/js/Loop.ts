import Events from "./events";
import Timing, { SegmentOptions } from "./util/Timings";

type LoopMethod = {
    (elapsed?: number, lastLoop?: number): void;
    // (): void; // Method that accepts no parameters
};
type Deferral = { remainingMs: number; callback: LoopMethod; };

const LOOP_METHODS_SLOW: LoopMethod[] = [];
const LOOP_METHODS_FAST: LoopMethod[] = [];
const DEFERRALS: Deferral[] = [];

let LAST_SLOW_LOOP = performance.now();
let LAST_FAST_LOOP = performance.now();

export function RegisterLoopMethod (callback: LoopMethod, needsFast = false) {
    const timingOptions: Partial<SegmentOptions> = {
        keepCount: 1000,
        slowThreshold: 1
    }

    if(needsFast == true
        && !LOOP_METHODS_FAST.includes(callback)) {
        timingOptions.type = "loop fast";
        const timedFunction = Timing.TimeFunction(callback, timingOptions as SegmentOptions);
        LOOP_METHODS_FAST.push(timedFunction);
    } else if(needsFast == false && !LOOP_METHODS_SLOW.includes(callback)) {
        timingOptions.type = "loop slow";
        const timedFunction = Timing.TimeFunction(callback, timingOptions as SegmentOptions);
        LOOP_METHODS_SLOW.push(timedFunction);
    }
}

// try to act like "setTimeout" but for the game loop
export function Defer(callback: LoopMethod, remainingMs?: number) {

    DEFERRALS.push({
        remainingMs: remainingMs || 0,
        callback
    });
}

function _slowLoop() {

    var elapsed = performance.now() - LAST_SLOW_LOOP;
    LAST_SLOW_LOOP = performance.now();

    Timing.ClearSegments(`loop slow`);

    for(var index = 0; index < LOOP_METHODS_SLOW.length; index++) {
        try {
            LOOP_METHODS_SLOW[index](elapsed, LAST_SLOW_LOOP);
        } catch (ex) {
            console.error(ex);
            debugger;
        }
    }

    _runDeferred(elapsed);

    setTimeout(_slowLoop, 300);
}

function _runDeferred(elapsed: number) {

    for(var index = 0; index < DEFERRALS.length; index++) {
        const deferral = DEFERRALS[index];
        deferral.remainingMs -= elapsed;
        if(deferral.remainingMs <= 0) {
            deferral.callback();
            DEFERRALS.splice(index, 1);
            index--;
            continue;
        }
    }
}

function _fastLoop() {

    var elapsed = performance.now() - LAST_FAST_LOOP;
    LAST_FAST_LOOP = performance.now();

    Timing.ClearSegments(`loop fast`);

    for(var index = 0; index < LOOP_METHODS_FAST.length; index++) {
        try {
            LOOP_METHODS_FAST[index](elapsed, LAST_FAST_LOOP);
        } catch (ex) {
            console.error(ex);
            debugger;
        }
    }

    setTimeout(_fastLoop, 30);
}

// TODO: Static / singleton?

Events.Subscribe(Events.List.GameStart, function() {
    _slowLoop();
    _fastLoop();
});
