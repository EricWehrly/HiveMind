import PostConstruct from "../../../../ts/decorators/PostConstruct";
import WorldCoordinate from "../../../coordinates/WorldCoordinate";
import Events from "../../../events";
import Entity from "../Entity";

export interface Playable {
    isPlayer: boolean;
}

export interface PlayableOptions {
    isPlayer?: boolean;
}


let _LOCAL_PLAYER: Entity & Playable;

export function GetLocalPlayer(): Entity {
    return _LOCAL_PLAYER;
}

type Constructor<T = {}> = new (...args: any[]) => T;
export function MakePlayable<T extends Constructor<Entity>>(Base: T, playableOptions: PlayableOptions)
    : T & Constructor<Playable>  {
    return class PlayableClass extends Base implements Playable {

        static get LOCAL_PLAYER() {
            return _LOCAL_PLAYER;
        }

        static set LOCAL_PLAYER(value) {
            _LOCAL_PLAYER = value;
        }

        isPlayer: boolean;
        private _lastPosition: WorldCoordinate = null;
        
        // since we can't do (postconstructor) decorator, 
        constructor(...args: any) {
            super(args);

            PostConstruct(this, 'initialize');
        }

        initialize(): void {

            this.isPlayer = playableOptions?.isPlayer || false;

            if(this.isPlayer) {
                if(_LOCAL_PLAYER) console.warn(`Setting the local player when one is already set.`);
                _LOCAL_PLAYER = this;
            }
        }

        move(amount: number) {
            super.move(amount);

            this.afterMove();
        }
            
        afterMove() {
            // TODO: We can probly extract to a method (#positionUpdated)
            // and call from within the position setter (in Entity)
            if(!this._position.equals(this._lastPosition)) {
                if(this.isPlayer) {
                    Events.RaiseEvent(Events.List.PlayerMoved, {
                        character: this,
                        from: this._lastPosition,
                        to: this._position
                        }, {
                        isNetworkBoundEvent: true
                    });
                    
                    if(!this._position.chunk.equals(this._lastPosition?.chunk)) {
                        Events.RaiseEvent(Events.List.PlayerChunkChanged, {
                            character: this,
                            from: this._lastPosition?.chunk,
                            to: this._position.chunk
                        }, {
                            isNetworkBoundEvent: true
                        });
                    }
                }
            }

            if(this._lastPosition == null) { 
                this._lastPosition = new WorldCoordinate(this._position.x, this._position.y);
            }
            else if(!this._position.equals(this._lastPosition)) {
                this._lastPosition.update(this._position);
            }
        }
    }
}

const Playable = {
    get LocalPlayer() {
        return _LOCAL_PLAYER
    },
    MakePlayable
}

export default Playable;
