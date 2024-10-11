import Debug from "../../../engine/js/util/Debug";
import { RunPostConstructMethods } from "../../../engine/ts/decorators/PostConstruct";
import HiveMindCharacter, { HivemindCharacterOptions } from "./HiveMindCharacter";

type Constructor<T = {}> = new (options: HivemindCharacterOptions) => T;
// TODO: Ideally HiveMindCharacter is valid as it extends Entity
// but currently, extends Constructor<Entity> is distinct and I don't know why
export type EntityMixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any; 

export default class HiveMindCharacterFactory {

    private static _defaultMixins: EntityMixin[] = [];

    static get DefaultMixins() {
        return this._defaultMixins;
    }

    static MakeCharacter<T extends HiveMindCharacter>(
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
            checkMixinForMethodConflicts(Mixed, mixinName, methodConflictReference);
            ExtendedCharacter = Mixed;
            classNames.push(ExtendedCharacter.name);
        }
        if (!options) options = {};
        // @ts-expect-error
        options.calledByFactory = true;
        const character = new ExtendedCharacter(options) as T;
        character.addDebugInfo('factoryClasses', classNames);
        RunPostConstructMethods(character, classNames);
        return character;
    }

    static SetDefaultMixin(mixin: EntityMixin, isDefault: boolean = true) {
        if (isDefault) {
            this._defaultMixins.push(mixin);
        } else {
            this._defaultMixins.remove(mixin);
        }
    }
}
export { HiveMindCharacterFactory } // allow named or default

// we want to migrate away from this eventually,
// as we may be able to work towards extending the base CharacterFactory
export const MakeHiveMindCharacter = HiveMindCharacterFactory.MakeCharacter;

// this method belongs outside of the class
// it is a very specific utility method, but a utility method nonetheless
function checkMixinForMethodConflicts(Mixed: any, mixinName: string, methodConflictReference: Map<string, string>) {
    if (!Debug.Enabled) return;
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
