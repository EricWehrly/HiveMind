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
    Object.freeze(characterType);

    return characterType;
}
