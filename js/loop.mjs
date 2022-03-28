const LOOP_METHODS_SLOW = [];
const LOOP_METHODS_FAST = [];
let LOOP_METHODS_REQUESTED = [];

let LAST_SLOW_LOOP = performance.now();
let LAST_FAST_LOOP = performance.now();

export function RegisterLoopMethod (callback, needsFast = false) {
    if(needsFast == true) {
        LOOP_METHODS_FAST.push(callback);
    } else {
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

function _slowLoop() {

    var elapsed = performance.now() - LAST_SLOW_LOOP;
    LAST_SLOW_LOOP = performance.now();

    for(var index = 0; index < LOOP_METHODS_SLOW.length; index++) {

        try {
            LOOP_METHODS_SLOW[index](elapsed, LAST_SLOW_LOOP);
        } catch (ex) {
            console.error("Problem in loop method");
            debugger;
        }
    }

    for(var requestedMethod of LOOP_METHODS_REQUESTED) {
        try {
            requestedMethod();
        } catch (ex) {
            console.error("Problem in requested method");
            debugger;
        }
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
            console.error("Problem in loop method");
            debugger;
        }
    }

    setTimeout(_fastLoop, 30);
}

/*
Monolith.Events.Subscribe(Monolith.Events.Names.GameDataLoad, function(event) {
    _slowLoop();
    _fastLoop();
});
*/

// TODO: Static / singleton?
_slowLoop();
_fastLoop();
