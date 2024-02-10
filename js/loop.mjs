import Events from "./events.mjs";

const LOOP_METHODS_SLOW = [];
const LOOP_METHODS_FAST = [];
const DEFERRALS = [];
let LOOP_METHODS_REQUESTED = [];

let LAST_SLOW_LOOP = performance.now();
let LAST_FAST_LOOP = performance.now();

export function RegisterLoopMethod (callback, needsFast = false) {
    if(needsFast == true
        && !LOOP_METHODS_FAST.includes(callback)) {
        LOOP_METHODS_FAST.push(callback);
    } else if(!LOOP_METHODS_SLOW.includes(callback)) {
        LOOP_METHODS_SLOW.push(callback);
    }
}

export function RequestMethod(callback) 
{
    if(!LOOP_METHODS_REQUESTED.includes(callback))
    {
        LOOP_METHODS_REQUESTED.push(callback);
    }
}

// try to act like "setTimeout" but for the game loop
export function Defer(callback, ms) {

    DEFERRALS.push({
        remainingMs: ms,
        callback
    });
}

function _slowLoop() {

    var elapsed = performance.now() - LAST_SLOW_LOOP;
    LAST_SLOW_LOOP = performance.now();

    for(var index = 0; index < LOOP_METHODS_SLOW.length; index++) {

        try {
            LOOP_METHODS_SLOW[index](elapsed, LAST_SLOW_LOOP);
        } catch (ex) {
            console.error(ex);
            debugger;
        }
    }

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

    for(var requestedMethod of LOOP_METHODS_REQUESTED) {
        requestedMethod();
        /*
        try {
        } catch (ex) {
            console.error("Problem in requested method");
            debugger;
        }
        */
    }
    LOOP_METHODS_REQUESTED = [];

    setTimeout(_slowLoop, 300);
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
