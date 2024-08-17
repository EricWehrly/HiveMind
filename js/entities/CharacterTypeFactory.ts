import CharacterType, { CharacterTypeOptions } from "./CharacterType";

export default function MakeCharacterType(options: CharacterTypeOptions) : CharacterType {
    return CharacterType.Create(options);
}
