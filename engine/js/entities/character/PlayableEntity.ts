import WorldCoordinate from "../../coordinates/WorldCoordinate";
import SentientEntity from "./SentientEntity";
import Events from "../../events";

// this starts getting into the territory of wanting to compose rather than extend ...
export default class PlayableEntity extends SentientEntity {

    // maybe we can find a way around this (better than how we do in game.js)
    // but for now hack in some dumb reference stuff
    private static _LOCAL_PLAYER: PlayableEntity;

    static get LOCAL_PLAYER() {
        return PlayableEntity._LOCAL_PLAYER;
    }

    static set LOCAL_PLAYER(value) {
        PlayableEntity._LOCAL_PLAYER = value;
    }

    private _lastPosition: WorldCoordinate = null;

    constructor(options: any) {
        super(options);

        this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
    }

    move(amount: number) {

        super.move(amount);

        this.afterMove();
    }

    // I hate this but whatever
    afterMove() {

        // TODO: We can probly extract to a method (#positionUpdated)
        // and call from within the position setter
        if(!this.position.equals(this._lastPosition)) {
            if(this.isPlayer) {
                Events.RaiseEvent(Events.List.PlayerMoved, {
                    character: this,
                    from: this._lastPosition,
                    to: this.position
                    }, {
                    isNetworkBoundEvent: true
                });
                
                if(!this.position.chunk.equals(this._lastPosition?.chunk)) {
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

        if(this._lastPosition == null) { 
            this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
        }
        else if(!this.position.equals(this._lastPosition)) {
            this._lastPosition.update(this.position);
        }
    }
}
