import { TechnologyTypes } from "./TechnologyTypes";

// TODO: convert technology.mjs to technology.ts and get rid of this guy
declare class Technology {
    type: TechnologyTypes;

    constructor(options: any);
}
