import { RunPostConstructMethods } from "../../../engine/js/entities/character/CharacterFactory";
import HiveMindCharacter, { HivemindCharacterOptions } from "./HiveMindCharacter";

// double check these values and then we can start using them ...
// export const HivemindCharacter_Default_Classes = [MakeSlimey, MakeLiving, MakeCombative, MakeEquipped, MakeSentient];

type Constructor<T = {}> = new (...args: any[]) => T;
type EntityMixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

export function MakeHiveMindCharacter<T extends HiveMindCharacter>(
    mixins: EntityMixin[], 
    options: HivemindCharacterOptions, 
    SuperClass: new (...args: any[]) => T = HiveMindCharacter as any
): T {
    let ExtendedCharacter = SuperClass;
    for (const mixin of mixins) {
        ExtendedCharacter = mixin(ExtendedCharacter, options);
    }
    if(!options) options = {};
    // @ts-expect-error
    options.calledByFactory = true;
    const character = new ExtendedCharacter(options) as T;
    RunPostConstructMethods(character);
    return character;
}
