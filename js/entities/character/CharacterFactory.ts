import { RunPostConstructMethods } from "../../../ts/decorators/PostConstruct";
import Entity, { EntityOptions } from "./Entity";

type Constructor<T = {}> = new (...args: any[]) => T;
export type EntityMixin = <T extends Constructor<Entity>>(Base: T, options: any) => any;

export function MakeCharacter<T extends Entity>(
    mixins: EntityMixin[], 
    options: EntityOptions, 
    SuperClass: new (...args: EntityOptions[]) => T = Entity as any
): T {
    const classNames = [];
    classNames.push(SuperClass.name);
    let ExtendedCharacter = SuperClass;
    for (const mixin of mixins) {
        ExtendedCharacter = mixin(ExtendedCharacter, options);
        classNames.push(ExtendedCharacter.name);
    }
    if(!options) options = {};
    // @ts-expect-error
    options.calledByFactory = true;
    const character = new ExtendedCharacter(options) as T;
    RunPostConstructMethods(character, classNames);
    return character;
}
