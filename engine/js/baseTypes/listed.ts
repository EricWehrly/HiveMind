export default class Listed {
    private _name;
    get name() { return this._name; }

    static Get<T extends Listed>(this: new (...args: any[]) => T, item: string | { name: string }): T | null {
        const list = (this as any).List;
        if(typeof item == "string") return list[item] as T;
        else if(item?.name) return list[item.name] as T;
        else {
            console.warn(`Don't know how to get ${item}`);
            return null;
        }
    }

    constructor(options: { name: string }) {
        if(!options.name) throw `Cannot create ${this.constructor.name} without 'name' property.`;

        this._name = options.name;

        const list = (this.constructor as any).List = (this.constructor as any).List || {};

        list[options.name] = this;
        const constructorName = String(this.constructor.name);

        // @ts-expect-error
        if (!window[constructorName]) {
            // @ts-expect-error
            window[constructorName] = {
                List: list
            }
        }
    }
}