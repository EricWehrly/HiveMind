import AI from "../../ai/basic";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import Events from "../../events.mjs";
import Entity from "./Entity";
import LivingEntity from "./LivingEntity";

// @ts-ignore
Events.List.PlayerChunkChanged = "PlayerChunkChanged";
// @ts-ignore
Events.List.PlayerMoved = "PlayerMoved";

export default class SentientLivingEntity extends LivingEntity {

    isPlayer: boolean = false;

    private _ai: AI;
    #spawnPosition: WorldCoordinate;
    _maxWanderDistance = 10
    private _target: Entity | WorldCoordinate;

    get ai() { return this._ai; }
    set ai(value) { console.warn(`something is trying to set ai, I'll deal with this later`, this); }

    get spawnPosition() { return this.#spawnPosition; }
    get maxWanderDistance() { return this._maxWanderDistance; }

    get target() {
        return this._target;
    }

    get targetPosition() {
        if(this.target instanceof Entity) return this.target.position;
        else if (this.target instanceof WorldCoordinate) return this.target;
        else return null;
    }

    set target(newValue: Entity | WorldCoordinate) {
        if (newValue === undefined || newValue == this._target) return;

        if(newValue == this._target) return;
        var oldValue = this._target;

        if(newValue instanceof WorldCoordinate) {
            this._target = newValue
        } else this._target = newValue;

        // @ts-ignore
        Events.RaiseEvent(Events.List.CharacterTargetChanged, {
            character: this,
            from: oldValue,
            to: this._target
        });
        console.debug(`New target for ${this.name}: ${this?.target?.x}, ${this?.target?.y}`);
    }

    constructor(options: any) {
        super(options);        
        this.#spawnPosition = new WorldCoordinate(this.position.x, this.position.y);
        this.setupAI(options?.ai);

        if(options.isPlayer) this.isPlayer = options.isPlayer;

        // @ts-ignore
        Events.Subscribe(Events.List.CharacterDied, this.sentientEntityDied.bind(this));
    }

    think() {
        if (this._ai) this._ai.think();
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
