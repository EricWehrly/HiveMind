import Debug from "../../../engine/js/util/Debug";
import { RunPostConstructMethods } from "../../../engine/ts/decorators/PostConstruct";
import HiveMindCharacter, { HivemindCharacterOptions } from "./HiveMindCharacter";

// double check these values and then we can start using them ...
// export const HivemindCharacter_Default_Classes = [MakeSlimey, MakeLiving, MakeCombative, MakeEquipped, MakeSentient];

type Constructor<T = {}> = new (options: HivemindCharacterOptions) => T;
type EntityMixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

export function MakeHiveMindCharacter<T extends HiveMindCharacter>(
    mixins: EntityMixin[], 
    options: HivemindCharacterOptions, 
    SuperClass: new (options: HivemindCharacterOptions) => T = HiveMindCharacter as any
): T {
    const classNames = [];
    classNames.push(SuperClass.name);
    let ExtendedCharacter = SuperClass;
    const methodConflictReference = new Map<string, string>();
    for (const mixin of mixins) {
        const mixinName = mixin.name;
        const Mixed = mixin(ExtendedCharacter, options,);
        checkMixinForMethodConflicts(Mixed, mixinName, methodConflictReference)
        ExtendedCharacter = Mixed;
        classNames.push(ExtendedCharacter.name);
    }
    if(!options) options = {};
    // @ts-expect-error
    options.calledByFactory = true;
    const character = new ExtendedCharacter(options) as T;
    character.addDebugInfo('factoryClasses', classNames);
    RunPostConstructMethods(character, classNames);
    return character;
}

function checkMixinForMethodConflicts(Mixed: any, mixinName: string, methodConflictReference: Map<string, string>) {
    if(!Debug.Enabled) return;
    for (const key of Object.getOwnPropertyNames(Mixed.prototype)) {
        const value = Mixed.prototype[key];
        if (typeof value === 'function' && key !== 'constructor') {
            if (methodConflictReference.has(key)) {
                console.warn(`Method collision detected: ${key} in ${mixinName} and ${methodConflictReference.get(key)}`);
            } else {
                methodConflictReference.set(key, mixinName);
            }
        }
    }
}
