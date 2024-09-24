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
