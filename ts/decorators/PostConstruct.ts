// currently, this class only works on entities
import Entity from "../../js/entities/character/Entity";

const PostConstructMethods = new Map<string, Function[]>();

type Constructor<T = {}> = new (...args: any[]) => T;

// currently, mixin static calls get repeated unintentionally
// so we need to write this a little differently as an accommodation
// export default function PostConstruct<T extends Constructor<Entity>>(target: T, methods: Function[]) {
export default function PostConstruct<T extends Constructor<Entity>>(target: T, methods: Function[]) {
    if(target == undefined || !target.name) debugger;
    PostConstructMethods.set(target.name, methods);
}

export function RunPostConstructMethods(entity: Entity, classNames: string[]) {    
    const methods: Function[] = [];
    if(classNames && classNames.length) {
        for(const className of classNames) {
            const classMethods = PostConstructMethods.get(className) || [];
            methods.push(...classMethods);
        }
    }

    for (const method of methods) {
        // bind to proper entity?
        // (entity as any)[methodName]();
        method.call(entity);
    }
}
