interface SegmentDictionary {
    [key: string]: SegmentCollection;
}

type TimingSegment = { 
    start?: number; 
    end?: number; 
    time?: number;  // essentially cache the elapsed time for the segment, since that's the information we're mostly going to want to use
};

type SegmentOptions = {
    type: string;
    keepTime?: number;
    keepCount?: number;
}

type SegmentCollection = {
    segments: TimingSegment[];
    options: SegmentOptions;
}

export default class Timing {

    static Segments: SegmentDictionary = {};
    static SegmentKeys: Record<string, string> = {};
    static Enabled: boolean = false;

    static StartSegment(name: string, options: SegmentOptions) {
        if (!this.Enabled) return;

        const segmentCollection = this._getSegmentCollection(name, options);
        segmentCollection.segments.push({
            start: performance.now()
        });
    }

    private static _getSegmentCollection(name: string, options: SegmentOptions) {
        if(!this.Segments.hasOwnProperty(name)) {
            this.Segments[name] = {
                segments: [],
                options
            };
        }

        return this.Segments[name];
    }
    
    // ends the last segment, rather than a specific one
    static EndSegment = function(name: string) {

        if(!Timing.Enabled) return;

        const segmentCollection = this.Segments[name];
        const segments = segmentCollection.segments;
        const index = segmentCollection.segments.length - 1;
        const segment = segments[index];
        segment.end = performance.now();
        segment.time = segment.end - segment.start;

        if(segment.keepCount && segments.length > segment.keepCount) {
            segments.splice(0, 1);
        }

        // TODO: keepTime
    }

    static GetSegments() {
        console.log(Timing.Segments);
    }
}

if(window) window.Timing = Timing;
