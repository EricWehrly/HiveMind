import PostConstruct from "../../../../ts/decorators/PostConstruct";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import Events from "../../../events";
import Character from "../../character";
import Entity, { CharacterFilterOptions } from "../Entity";
import { Combative } from "./Combative";

Events.List.PlayerChunkChanged = "PlayerChunkChanged";
Events.List.PlayerMoved = "PlayerMoved";

export interface Playable {
    isPlayer: boolean;
}

export interface PlayableOptions {
    isPlayer?: boolean;
}

// TODO: reduce to Entity?
let _LOCAL_PLAYER: Character & Playable & Combative;

export function GetLocalPlayer(): Entity {
    return _LOCAL_PLAYER;
}

type Constructor<T = {}> = new (...args: any[]) => T;
export function MakePlayable<T extends Constructor<Entity>>(Base: T)
    : T & Constructor<Playable> {
    return class PlayableClass extends Base implements Playable {

        static get LOCAL_PLAYER() {
            return _LOCAL_PLAYER;
        }

        static set LOCAL_PLAYER(value) {
            _LOCAL_PLAYER = value;
        }

        static {
            // TODO: static only once, not with each Playable Mixin
            PostConstruct(PlayableClass, PlayableClass.prototype.initialize);
        }

        isPlayer: boolean;
        private _lastPosition: Readonly<WorldCoordinate> = null;

        constructor(...args: any) {
            super(...args);

            const { isPlayer } = args[0] || undefined;
            this.isPlayer = isPlayer || false;

            if (this.position) this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
        }

        initialize(): void {

            if (this.isPlayer) {
                if (_LOCAL_PLAYER) console.warn(`Setting the local player when one is already set.`);
                _LOCAL_PLAYER = this as unknown as Character & Playable & Combative;
            }
        }

        move(amount: number) {
            super.move(amount);

            this.afterMove();
        }

        afterMove() {
            // TODO: We can probly extract to a callback (#positionUpdated)
            // and call from within the position setter (in Entity)
            if (!this.position.equals(this._lastPosition)) {
                if (this.isPlayer) {
                    Events.RaiseEvent(Events.List.PlayerMoved, {
                        character: this,
                        from: this._lastPosition,
                        to: this.position
                    }, {
                        isNetworkBoundEvent: true
                    });

                    if (!this.position.chunk.equals(this._lastPosition?.chunk)) {
                        Events.RaiseEvent(Events.List.PlayerChunkChanged, {
                            character: this,
                            from: this._lastPosition?.chunk,
                            to: this.position.chunk
                        }, {
                            isNetworkBoundEvent: true
                        });
                    }
                }
            }

            if (this._lastPosition == null) {
                this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
            }
            else if (!this.position.equals(this._lastPosition)) {
                this._lastPosition.update(this.position);
            }
        }

        shouldFilterCharacter(character: Entity & Playable, options: CharacterFilterOptions & PlayableOptions) {

            if (options.isPlayer != null && character.isPlayer != options.isPlayer) {
                return true;
            }

            return super.shouldFilterCharacter(character, options);
        }
    }
}

export function IsPlayable(entity: Entity): entity is Entity & Playable {
    const playable = entity as Entity & Playable;
    return typeof playable.isPlayer === 'boolean';
}
