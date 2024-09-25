let raisedEvents: string[] = [];
const mockEvents = jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation((eventName) => {
                raisedEvents.push(eventName);
             }),
            List: new Proxy({}, {
                get: function(target, name) {
                    return name;
                },
                set: function(target, name, value) {
                    return true;  // Indicate that the assignment succeeded
                }
            })
        }
    };
});

function resetTrackedEvents() {
    raisedEvents = [];
}

// for now
export default mockEvents;

export {
    mockEvents,
    resetTrackedEvents,
    // TODO: wrap in getter?
    raisedEvents
}
