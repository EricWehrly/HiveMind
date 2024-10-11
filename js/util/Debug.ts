let _debugEnabled = false;
// enable executing code that checks performance against expectations
// (in instrumenting methods)
let ENABLE_PERFORMANCE_TRAPS = false;

function IsPastPerformanceThreshold(startTime: number, thresholdMS: number) {
    return ENABLE_PERFORMANCE_TRAPS && performance.now() - startTime > thresholdMS;
}

const Debug = {
    ENABLE_PERFORMANCE_TRAPS,
    get Enabled() { return _debugEnabled; },
}

export default Debug;
