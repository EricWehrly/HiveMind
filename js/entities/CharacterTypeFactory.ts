import Research from "../../engine/js/research";
import CharacterType, { CharacterTypeOptions } from "./CharacterType";

// TODO: Unit test this. Please. Please?
export default function MakeCharacterType(options: CharacterTypeOptions) : CharacterType {
    const characterType = CharacterType.Create(options);
    
    if(options.research) {
        characterType.research = new Research({
            name: options.name,
            ...options.research
        });
    }
    // why is it all of a sudden a problem to freeze this?
    // (hit an exception trying to set isStudied private value through setter)
    // Object.freeze(characterType);

    return characterType;
}
