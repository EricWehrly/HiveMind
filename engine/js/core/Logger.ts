class Logger {

    static readonly instance: Logger = new Logger();

    constructor() {
        this.log = console.log;
        this.error = console.error;
    }

    log(message: string, ...optionalParams: any[]) {        
        if (process?.env?.NODE_ENV !== 'test') {
            console.log(message, ...optionalParams);
        }
    }

    error(message: string, ...optionalParams: any[]) {        
        if (process?.env?.NODE_ENV !== 'test') {
            console.error(message, ...optionalParams);
        }
    }

    warn(message: string, ...optionalParams: any[]) {        
        if (process?.env?.NODE_ENV !== 'test') {
            console.warn(message, ...optionalParams);
        }
    }

    debug(message: string, ...optionalParams: any[]) {        
        if (process?.env?.NODE_ENV !== 'test') {
            console.debug(message, ...optionalParams);
        }
    }
}

export default Logger.instance;
