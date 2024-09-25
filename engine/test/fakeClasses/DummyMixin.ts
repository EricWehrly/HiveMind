import Entity from "../../js/entities/character/Entity";
import PostConstruct from "../../ts/decorators/PostConstruct";

export interface Dummy {
    postConstructCallCount: number;
}

export let staticCallCount = 0;

type Constructor<T = {}> = new (...args: any[]) => T;
export function DummyMixin<T extends Constructor<Entity>>(Base: T): T {
    return class DummyMixinClass extends Base implements Dummy {

        postConstructCallCount = 0;

        static {
            PostConstruct(DummyMixinClass, DummyMixinClass.prototype.postConstruct);
            staticCallCount++;
        }

        postConstruct(): void {
            this.postConstructCallCount++;
        }
    }
}
