import CharacterType from "../../../../js/entities/CharacterType";
import { WorldObjectOptions } from "../../baseTypes/WorldObject";
import EntityRenderingSettings from "./EntityRenderingSettings";

export interface EntityOptions extends WorldObjectOptions {
    id?: string;
    name?: string;
    characterType?: CharacterType;
    entityRenderingSettings?: EntityRenderingSettings;
    color?: string;
    cost?: number;
    flags?: string[];
    attributes?: {
        speed?: number;
        vision?: number;
    }
}
