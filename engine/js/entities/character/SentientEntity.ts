import AI from "../../ai/basic";
import { WorldObjectOptions } from "../../baseTypes/WorldObject";
import WorldCoordinate from "../../coordinates/WorldCoordinate";
import Events from "../../events";
import Entity, { EntityEvent, EntityOptions } from "./Entity";

Events.List.PlayerChunkChanged = "PlayerChunkChanged";
Events.List.PlayerMoved = "PlayerMoved";

export interface SentientEntityOptions {
    ai?: new (...args: any[]) => AI;
    isPlayer?: boolean;
}

export default class SentientEntity extends Entity {

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
        return this.ai?.targetEntity;
    }

    set target(newValue: Entity | WorldCoordinate) {
        if (newValue === undefined || newValue == this._target) return;

        if(newValue == this._target) return;
        var oldValue = this._target;

        if(newValue instanceof WorldCoordinate) {
            this._target = newValue
        } else this._target = newValue;

        Events.RaiseEvent(Events.List.CharacterTargetChanged, {
            character: this,
            from: oldValue,
            to: this._target
        });
        // console.debug(`New target for ${this.name}: ${this?.target?.x}, ${this?.target?.y}`);
    }

    constructor(options: EntityOptions & SentientEntityOptions & WorldObjectOptions) {
        super(options);        
        this.#spawnPosition = new WorldCoordinate(this.position.x, this.position.y);
        // TODO: unit test this 'null' thing
        const ai = options.ai !== undefined ? options.ai : options.characterType?.ai;
        this.setupAI(ai);

        if(options.isPlayer) this.isPlayer = options.isPlayer;

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

    private sentientEntityDied(event: EntityEvent) {

        const entity = event.entity;

        if(entity.equals(this)
            && entity instanceof SentientEntity
            && entity.isPlayer) {
            alert('So the player is dead now ... this is game over.');
        }
    }
}
