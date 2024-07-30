import Listed from "../baseTypes/listed.ts";

export default class MessageLog extends Listed {

    static RETENTION_STRATEGY = {
        MESSAGE_COUNT: "MESSAGE_COUNT",
        TIME: "TIME"
    }

    static #MESSAGE_COUNT_DEFAULT = 100;
    static #TIME_DEFAULT = 60 * 1000;

    #name;
    #retentionStrategy;
    #logs = [];

    #retentionParameter;
    get retentionParameter() {

        if(this.#retentionParameter) return this.#retentionParameter;

        if(this.#retentionStrategy == MessageLog.RETENTION_STRATEGY.MESSAGE_COUNT) {
            return MessageLog.#MESSAGE_COUNT_DEFAULT;
        } else {
            return MessageLog.#TIME_DEFAULT;
        }
    }

    get logs() {
        return this.#logs;
    }

    constructor(options) {

        if(!options.name) throw `MessageLog needs name!`;

        super(options);

        this.#name = options.name;

        if(options.retentionStrategy
            && options.retentionStrategy in MessageLog.RETENTION_STRATEGY) {
            this.#retentionStrategy = options.retentionStrategy;
        } else {
            console.warn("Unimplemented.");
        }

        if(options.retentionParameter) this.#retentionParameter = options.retentionParameter;
        if(options.maxMessages) this.#retentionParameter = options.maxMessages;

        // TODO: if retention is time, then loop method
    }

    log(message, options) {

        const messageObject = {
            time: performance.now(),
            message,
            ...options
        }
        this.#logs.push(messageObject);

        if(this.#retentionStrategy == MessageLog.RETENTION_STRATEGY.MESSAGE_COUNT) {
            const messagesToRetain = this.retentionParameter;
            while(this.#logs.length > messagesToRetain) {
                this.#logs.splice(0, 1);
            }
        }
    }
}
