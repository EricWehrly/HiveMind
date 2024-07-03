export default function PostConstruct(target: any, propertyKey: string) {
    if (!target.constructor._postConstructMethods) {
        target.constructor._postConstructMethods = [];
    }
    target.constructor._postConstructMethods.push(propertyKey);
}

