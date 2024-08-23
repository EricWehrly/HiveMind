// ideally this method should be internal and not meaningfully testable, but that's not where we're at, is it?

import { createMock } from "../../testHelpers/helpers";
import mockMap from "../../testHelpers/mockMap";
import CharacterType from "../../../../js/entities/CharacterType";
import Entity from "../../../js/entities/character/Entity";

jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation(() => { }),
            List: new Proxy({}, {
                get: function(target, name) {
                    return name;
                },
                set: function(target, name, value) {
                    return true;  // Indicate that the assignment succeeded
                }
            })
        }
    };
});
jest.mock('@/engine/js/mapping/GameMap.ts', () => mockMap);
jest.mock('@/engine/js/technology.ts', () => createMock);
jest.mock('@/engine/js/research.ts', () => createMock);

describe('Entity.shouldFilterCharacter', () => {

    const referenceEntity = new Entity();
    //@ts-expect-error
    const referenceType = new CharacterType({
        name: 'referenceType'
    });
    //@ts-expect-error
    const otherType = new CharacterType({
        name: 'otherType'
    });

    it('should filter unmatched characterType', () => {
        const entity = new Entity({
            characterType: referenceType
        });

        const filterOptions = {
            characterType: otherType
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(true);
    });

    it('should pass matched characterType', () => {
        const entity = new Entity({
            characterType: referenceType
        });

        const filterOptions = {
            characterType: referenceType
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(false);
    });

    it('should filter any excludes', () => {
        const entity = new Entity();

        const filterOptions = {
            exclude: [ entity ]
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(true);
    });

    it('should pass not excluded', () => {
        const entity = new Entity();

        const filterOptions = {
            exclude: [ referenceEntity ]
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(false);
    });

    it('should filter unmatched characterProperty', () => {
        const entity = new Entity({
            id: 'testId'
        });

        const filterOptions = {
            characterProperties: {
                id: 'else'            
            }
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(true);
    });

    it('should pass matching characterProperty', () => {
        const entity = new Entity({
            id: 'testId'
        });

        const filterOptions = {
            characterProperties: {
                id: 'testId'            
            }
        };
        const result = referenceEntity.shouldFilterCharacter(entity, filterOptions);

        expect(result).toBe(false);
    });
});
