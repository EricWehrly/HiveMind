import { EntityMixin, MakeCharacter } from "../../../../../js/entities/character/CharacterFactory";
import Entity from "../../../../../js/entities/character/Entity";
import { Combative, MakeCombative } from "../../../../../js/entities/character/mixins/Combative";
import Faction from "../../../../../js/entities/faction";

describe('Combative', () => {
    describe('constructor', () => {
        it('should assign faction', () => {
            const faction = new Faction({ name: 'test', color: 'red' });
            const characterOptions = {
                faction
            }
            const combative = MakeCharacter([MakeCombative as EntityMixin], characterOptions) as Entity & Combative;

            expect(combative.faction).toEqual(faction);
        });
    });
});
