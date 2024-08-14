import HiveMindCharacter from "./HiveMindCharacter";

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
    return new ExtendedCharacter(options) as T;
}