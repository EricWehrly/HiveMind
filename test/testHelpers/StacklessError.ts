// ok so this is the best we can come up with
// to get around the garbage heap jest gives us in a stack trace with every error?

export default class StacklessError extends Error {
    constructor(message: string) {
        super(message);
        // this.name = 'StacklessError';
        this.stack = this.message;
    }
}
