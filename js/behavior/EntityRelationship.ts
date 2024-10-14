export enum EntityRelationshipType {
    Friendly,
    Neutral,
    Hostile,
    Afraid
};

// TODO: explain amount
export type EntityRelationship = {
    type: EntityRelationshipType,
    amount: number
};
