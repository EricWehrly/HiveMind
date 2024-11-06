export interface TrackedObjectOptions {   
    keepTime?: number;
    keepCount?: number;
    formatString?: string;
}

// TODO: use this somewhere
export class TrackedObject {

    private _trackedValues: number[] = [];
    private _firstTrackedTimestamp: number;
    private _keepTime?: number;
    private _keepCount?: number;

    constructor(options: TrackedObjectOptions) {

        this._keepTime = options.keepTime;
        this._keepCount = options.keepCount;
    }

    public get(): Readonly<number[]> {
        return this._trackedValues;
    }

    // getOne

    public get median() {
        if(this._trackedValues.length == 0) return null;
        return this._trackedValues.reduce((sum, segment) => sum + segment, 0) / this._trackedValues.length;
    }

    public append(value: number) {

        this._trackedValues.push(value);

        if(this._keepCount && this._trackedValues.length > this._keepCount) {
            this._trackedValues.splice(0, 1);
        }

        if(this._keepTime) {
            if(!this._firstTrackedTimestamp) {
                this._firstTrackedTimestamp = performance.now();
            } else {
                if(performance.now() - this._firstTrackedTimestamp > this._keepTime) {
                    this._trackedValues = [];
                    this._firstTrackedTimestamp = null;
                }
            }
        }
    }
}
