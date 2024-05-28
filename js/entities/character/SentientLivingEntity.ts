import AI from "../../ai/basic.mjs";
import Point from "../../baseTypes/point.mjs";
import Events from "../../events.mjs";
import LivingEntity from "./LivingEntity";

export default class SentientLivingEntity extends LivingEntity {

    isPlayer: boolean = false;

    ai: AI;
    #spawnPosition: Point;
    _maxWanderDistance = 10

    get spawnPosition() {
        return this.#spawnPosition;
    }

    constructor(options: any) {
        super(options);        
        this.#spawnPosition = new Point(this.position.x, this.position.y);
        this.setupAI(options?.ai);

        // @ts-ignore
        Events.Subscribe(Events.List.CharacterDied, this.sentientEntityDied.bind(this));
    }

    think() {
        if (this.ai) this.ai.think();
    }

    private setupAI(ai: new (...args: any[]) => AI) {
        // TODO: let's default to no AI at all unless prescribed ...
        if (ai === undefined) this.ai = new AI(this);

        // TODO: Would be better to type-validate aiType (but it's a class, not an instance)
        else if (ai != null) this.ai = new ai(this);
    }

    private sentientEntityDied(entity: LivingEntity) {

        if(entity.equals(this)
            && entity instanceof SentientLivingEntity
            && entity.isPlayer) {
            alert('So the player is dead now ... this is game over.');
        }
    }
}
