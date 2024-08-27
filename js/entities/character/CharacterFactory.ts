import Entity from "./Entity";

type Constructor<T = {}> = new (...args: any[]) => T;
export type EntityMixin = <T extends Constructor<Entity>>(Base: T, options: any) => any;

export function MakeCharacter<T extends Entity>(
    mixins: EntityMixin[], 
    options: any, 
    SuperClass: new (...args: any[]) => T = Entity as any
): T {
    let ExtendedCharacter = SuperClass;
    for (const mixin of mixins) {
        ExtendedCharacter = mixin(ExtendedCharacter, options);
    }
    if(!options) options = {};
    options.calledByFactory = true;
    const character = new ExtendedCharacter(options) as T;
    RunPostConstructMethods(character);
    return character;
}

export function RunPostConstructMethods(entity: Entity) {
    // @ts-expect-error
    const methods: string[] = entity.constructor._postConstructMethods || [];
    for (const methodName of methods) {
        (entity as any)[methodName]();
    }
}
