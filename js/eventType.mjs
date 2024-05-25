export default class EventType {

    static List = {};

    name;

    constructor(name) {
        this.name = name;

        EventType.List[name] = this;
    }
}
