import Listed from "../baseTypes/listed";

export enum RETENTION_STRATEGY {
    MESSAGE_COUNT = "MESSAGE_COUNT",
    TIME = "TIME"
}

export interface LoggedMessage {
    message: string;
}

export interface MessageLogOptions {
    name: string;
    retentionStrategy: RETENTION_STRATEGY;
    maxMessages?: number;
    retentionAmount?: number;
}

export default class MessageLog extends Listed {

    static #MESSAGE_COUNT_DEFAULT = 100;
    static #TIME_DEFAULT = 60 * 1000;

    private _retentionStrategy;
    private _logs: LoggedMessage[] = [];
    private _logUpdatedCallbacks: Function[] = [];

    _retentionAmount;
    get retentionParameter() {

        if(this._retentionAmount) return this._retentionAmount;

        if(this._retentionStrategy == RETENTION_STRATEGY.MESSAGE_COUNT) {
            return MessageLog.#MESSAGE_COUNT_DEFAULT;
        } else {
            return MessageLog.#TIME_DEFAULT;
        }
    }

    get logs() {
        return this._logs;
    }

    constructor(options: MessageLogOptions) {

        super(options);

        this._retentionStrategy = options.retentionStrategy;
        if(options.retentionAmount) this._retentionAmount = options.retentionAmount;
        if(options.maxMessages) this._retentionAmount = options.maxMessages;

        // TODO: if retention is time, then register slow-loop method?
        // we could also just defer removing upon adding
    }

    // TODO: figure out what options are being used for ... 
    // I'm worried we're overloading behavior ...
    public log(message: string, options: any) {

        const messageObject = {
            time: performance.now(),
            message,
            ...options
        }
        this._logs.push(messageObject);

        if(this._retentionStrategy == RETENTION_STRATEGY.MESSAGE_COUNT) {
            const messagesToRetain = this.retentionParameter;
            while(this._logs.length > messagesToRetain) {
                this._logs.splice(0, 1);
            }
        }

        this.logsUpdated();
    }

    private logsUpdated() {
        for (var callback of this._logUpdatedCallbacks) {
            callback();
        }
    }

    public onLogsUpdated(callback: Function): void {
        this._logUpdatedCallbacks.push(callback);
    }
}
