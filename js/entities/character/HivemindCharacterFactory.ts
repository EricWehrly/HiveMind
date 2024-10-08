import Debug from "../../../engine/js/util/Debug";
import { RunPostConstructMethods } from "../../../engine/ts/decorators/PostConstruct";
import HiveMindCharacter, { HivemindCharacterOptions } from "./HiveMindCharacter";

type Constructor<T = {}> = new (options: HivemindCharacterOptions) => T;
export type EntityMixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

const _defaultMixins: EntityMixin[] = [];

function SetDefaultMixin(mixin: EntityMixin, isDefault: boolean = true) {
    if(isDefault) {
        _defaultMixins.push(mixin);
    } else {
        const index = _defaultMixins.indexOf(mixin);
        if(index > -1) {
            _defaultMixins.splice(index, 1);
        }
    }
}

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

export const HiveMindCharacterFactory = {
    MakeCharacter: MakeHiveMindCharacter,
    SetDefaultMixin,
    get DefaultMixins() {
        return _defaultMixins;
    }
};

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
