import Entity from "./Entity";

type Constructor<T = {}> = new (...args: any[]) => T;
type EntityMixin = <T extends Constructor<Entity>>(Base: T, options: any) => any;

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
    return new ExtendedCharacter(options) as T;
}
