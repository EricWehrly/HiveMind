import Events from "./events";
import Timing, { SegmentOptions } from "./util/Timings";

type LoopMethod = { 
    (elapsed?: number, lastLoop?: number): void; // Method that can accept two optional parameters
    // (elapsed: number, lastLoop: number): void; // Method that accepts two parameters
    // (): void; // Method that accepts no parameters
};
type Deferral = { remainingMs: number; callback: LoopMethod; };

const LOOP_METHODS_SLOW: LoopMethod[] = [];
const LOOP_METHODS_FAST: LoopMethod[] = [];
const DEFERRALS: Deferral[] = [];

let LAST_SLOW_LOOP = performance.now();
let LAST_FAST_LOOP = performance.now();

export function RegisterLoopMethod (callback: LoopMethod, needsFast = false) {
    if(needsFast == true
        && !LOOP_METHODS_FAST.includes(callback)) {
        LOOP_METHODS_FAST.push(callback);
    } else if(!LOOP_METHODS_SLOW.includes(callback)) {
        LOOP_METHODS_SLOW.push(callback);
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

    const timingOptions: SegmentOptions = {
        type: "loop slow",
        keepCount: 1000,
        slowThreshold: 1
    }
    for(var index = 0; index < LOOP_METHODS_SLOW.length; index++) {
        try {
            Timing.StartSegment(`slow${index}`, timingOptions);
            LOOP_METHODS_SLOW[index](elapsed, LAST_SLOW_LOOP);
            Timing.EndSegment(`slow${index}`);
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
