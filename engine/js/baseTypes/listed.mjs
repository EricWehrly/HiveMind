export default class Listed {

    // I think we can change and convert this to "options"
    // to support get options.type =
    // but with arbitrary matching
    static Get(item) {
        if(typeof item == "string") return this.List[item];
        else if(item.name) return this.List[item.name];
        else {
            console.warn(`Don't know how to get ${item}`);
            return null;
        }
    }

    constructor(options = {}) {

        if(!options.name) throw `Cannot create ${this.constructor.name} without 'name' property.`;

        if (!this.constructor.List) {
            this.constructor.List = {};

            window[this.constructor.name] = {
                List: this.constructor.List
            }
        }
        
        Object.assign(this, options);
        this.constructor.List[options.name] = this;
    }
}
