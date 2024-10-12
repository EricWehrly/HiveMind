// currently, this class only works on entities
import Entity from "../../js/entities/character/Entity";

const PostConstructMethods = new Map<string, Function[]>();

type Constructor<T = {}> = new (...args: any[]) => T;
/**
 * Defer isn't certain to be the immediate next thing after all constructors, 
 * certain entity setup possibilities need to be run exactly once all constructors have
 * but definitely before anything else runs
 * this is the utility of leveraging this method in the CharacterFactory
 */
// currently, mixin static calls get repeated unintentionally
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
