import HiveMindCharacter from "./HiveMindCharacter";

type Constructor<T = {}> = new (...args: any[]) => T;
type Mixin = <T extends Constructor<HiveMindCharacter>>(Base: T, options: any) => any;

export function MakeHiveMindCharacter(mixins: Mixin[], options: any): HiveMindCharacter {
    let extended = HiveMindCharacter;
    while (mixins.length) {
        extended = mixins.pop()(extended, options);
    }
    const creature = new extended(options);
    return creature;
}
