export default class Listed {

    static Get(name) {
        return this.List[name];
    }

    constructor(options = {}) {

        if(!options.name) throw Exception("No.");

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
