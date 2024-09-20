export default jest.mock('@/engine/js/events', () => {
    return {
        __esModule: true, // this property makes it work
        default: {
            Subscribe: jest.fn().mockImplementation(() => { }),
            RaiseEvent: jest.fn().mockImplementation(() => { }),
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
