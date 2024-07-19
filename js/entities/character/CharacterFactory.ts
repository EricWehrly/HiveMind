import HiveMindCharacter from "./HiveMindCharacter";

type Constructor<T = {}> = new (...args: any[]) => T;
type Mixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

export function MakeHiveMindCharacter<T extends HiveMindCharacter>(
    mixins: Mixin[], 
    options: any, 
    SuperClass: new (...args: any[]) => T = HiveMindCharacter as any
): T {
    let ExtendedCharacter = SuperClass;
    for (const mixin of mixins) {
        ExtendedCharacter = mixin(ExtendedCharacter, options);
    }
    return new ExtendedCharacter(options) as T;
}
