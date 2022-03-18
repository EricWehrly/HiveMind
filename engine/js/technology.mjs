export default class Technology {

    static List = {};

    static {
        window.Technology = {
            List: Technology.List
        }
    }

    constructor(options = {}) {

        // TODO: reject if missing required options
        if(!options.name) throw Exception("No.");
        Object.assign(this, options);

        Technology.List[this.name] = this;
    }
}
