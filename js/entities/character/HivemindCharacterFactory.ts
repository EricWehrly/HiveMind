import { RunPostConstructMethods } from "../../../engine/js/entities/character/CharacterFactory";
import HiveMindCharacter from "./HiveMindCharacter";

// double check these values and then we can start using them ...
// export const HivemindCharacter_Default_Classes = [MakeSlimey, MakeLiving, MakeCombative, MakeEquipped, MakeSentient];

type Constructor<T = {}> = new (...args: any[]) => T;
type EntityMixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

export function MakeHiveMindCharacter<T extends HiveMindCharacter>(
    mixins: EntityMixin[], 
    options: any, 
    SuperClass: new (...args: any[]) => T = HiveMindCharacter as any
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
