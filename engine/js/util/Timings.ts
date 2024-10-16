type TimingSegment = { 
    start?: number; 
    end?: number; 
    time?: number;  // essentially cache the elapsed time for the segment, since that's the information we're mostly going to want to use
};

export type SegmentOptions = {
    type: string;
    keepTime?: number;
    keepCount?: number;
    slowThreshold?: number;
}

class SegmentCollection {
    segments: TimingSegment[] = [];
    readonly options: SegmentOptions;

    // if options.keepCount
    // use these vars to track 'state'
    // (should we have a boolean that chooses if this is on?)
    firstSegmentTimestamp: number;
    segmentCount: number = 0;

    constructor(options: SegmentOptions) {
        this.options = options;
    }
}

export default class Timing {

    static Segments: Record<string, SegmentCollection> = {};
    static SegmentKeys: Record<string, string> = {};
    static Enabled: boolean = false;

    static TimeFunction<T extends (...args: any[]) => any>(func: T, options: SegmentOptions): T {

        if(!Timing.Enabled) return func;

        if(!func.name) throw new Error('Timing: TimeFunction requires a named function');
        return ((...args: Parameters<T>): ReturnType<T> => {
            this.StartSegment(func.name, options);
            const result = func(...args);
            this.EndSegment(func.name);
            return result;
        }) as T;
    }

    static StartSegment(name: string, options: SegmentOptions) {
        if (!Timing.Enabled) return;

        const segmentCollection = Timing._getSegmentCollection(name, options);
        segmentCollection.segments.push({
            start: Timing._getCurrentTime()
        });
    }

    private static _getSegmentCollection(name: string, options: SegmentOptions): SegmentCollection {
        if(!Timing.Segments.hasOwnProperty(name)) {
            Timing.Segments[name] = new SegmentCollection(options);
        }

        return Timing.Segments[name];
    }
    
    // ends the last segment, rather than a specific one
    static EndSegment = function(name: string) {

        if(!Timing.Enabled) return;

        const segmentCollection = Timing.Segments[name];
        const { keepCount, keepTime, slowThreshold } = segmentCollection.options;
        const segments = segmentCollection.segments;
        const index = segmentCollection.segments.length - 1;
        const segment = segments[index];
        segment.end = Timing._getCurrentTime();
        segment.time = Timing._formatTime(segment.end - segment.start);

        if(keepCount && segments.length > keepCount) {
            segments.splice(0, 1);
        }

        if(keepTime) {
            if(!segmentCollection.firstSegmentTimestamp) {
                segmentCollection.firstSegmentTimestamp = segment.start;
            } else {
                if(performance.now() - segmentCollection.firstSegmentTimestamp > keepTime) {
                    segmentCollection.segments = [];
                    segmentCollection.firstSegmentTimestamp = null;
                    segmentCollection.segmentCount = 0;
                }
            }
        }

        if(slowThreshold && segment.time < slowThreshold) {
            segments.splice(index, 1);
        }
    }

    private static _getCurrentTime() {
        // use lower precision timestamps, which are easier for human eyes to scan through
        return Timing._formatTime(performance.now());
    }

    private static _formatTime(time: number) {
        return parseFloat(time.toFixed(2));
    }

    static GetSegments() {
        console.log(Timing.Segments);
    }
}

if(window) window.Timing = Timing;
