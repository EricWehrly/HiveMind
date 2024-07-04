import AI from "../../ai/basic.mjs";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import Events from "../../events.mjs";
import LivingEntity from "./LivingEntity";

// @ts-ignore
Events.List.PlayerChunkChanged = "PlayerChunkChanged";
// @ts-ignore
Events.List.PlayerMoved = "PlayerMoved";

export default class SentientLivingEntity extends LivingEntity {

    isPlayer: boolean = false;

    private _ai: AI;
    #spawnPosition: WorldCoordinate;
    private _lastPosition: WorldCoordinate = null;
    _maxWanderDistance = 10

    get ai() { return this._ai; }
    set ai(value) { console.warn(`something is trying to set ai, I'll deal with this later`, this); }

    get spawnPosition() { return this.#spawnPosition; }

    constructor(options: any) {
        super(options);        
        this.#spawnPosition = new WorldCoordinate(this.position.x, this.position.y);
        this._lastPosition = new WorldCoordinate(this.position.x, this.position.y);
        this.setupAI(options?.ai);

        if(options.isPlayer) this.isPlayer = options.isPlayer;

        // @ts-ignore
        Events.Subscribe(Events.List.CharacterDied, this.sentientEntityDied.bind(this));
    }

    think() {
        if (this._ai) this._ai.think();
    }

    move(amount: number) {

        super.move(amount);

        this.afterMove();
    }

    // I hate this but whatever
    afterMove() {

        // TODO: We can probly extract to a method (#positionUpdated)
        // and call from within the position setter
        if(!this._position.equals(this._lastPosition)) {
            if(this.isPlayer) {
                // @ts-ignore
                Events.RaiseEvent(Events.List.PlayerMoved, {
                    character: this,
                    from: this._lastPosition,
                    to: this._position
                    }, {
                    isNetworkBoundEvent: true
                });
                
                if(!this._position.chunk.equals(this._lastPosition?.chunk)) {
                    // @ts-ignore
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

    private setupAI(ai: new (...args: any[]) => AI) {
        // TODO: let's default to no AI at all unless prescribed ...
        if (ai === undefined) this._ai = new AI(this);

        // TODO: Would be better to type-validate aiType (but it's a class, not an instance)
        else if (ai != null) {
            this._ai = new ai(this);
        }
    }

    private sentientEntityDied(entity: LivingEntity) {

        if(entity.equals(this)
            && entity instanceof SentientLivingEntity
            && entity.isPlayer) {
            alert('So the player is dead now ... this is game over.');
        }
    }
}
