export default function PostConstructClass<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            // this causes us to exit the current stack, in effect,
            // which is acceptable now, but could be unfortunate later
            setTimeout(() => {
                const postConstructMethods = (this.constructor as any)._postConstructMethods;
                if (postConstructMethods) {
                    for (const methodName of postConstructMethods) {
                        if (typeof (this as any)[methodName] === 'function') {
                            (this as any)[methodName]();
                        }
                    }
                }
            }, 0);
        }
    };
}
