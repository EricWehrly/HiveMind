import mockEvents from "../../../../testHelpers/mockEvents";
import mockMap from "../../../../testHelpers/mockMap";
import { EntityMixin, MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import Entity, { EntityOptions } from "../../../../../js/entities/character/Entity";
import { Combative, CombativeOptions, MakeCombative } from "../../../../../js/entities/character/mixins/Combative";
import Faction from "../../../../../js/entities/faction";

jest.mock('@/engine/js/events', () => mockEvents);
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);

describe('Combative', () => {
    describe('constructor', () => {
        it('should assign faction', () => {
            const faction = new Faction({ name: 'test', color: 'red' });
            const characterOptions: EntityOptions & CombativeOptions = {
                faction
            }
            const combative = MakeCharacter([MakeCombative as EntityMixin], characterOptions) as Entity & Combative;

            expect(combative.faction).toEqual(faction);
        });
    });
});
