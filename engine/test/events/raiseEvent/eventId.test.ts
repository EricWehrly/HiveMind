import Events from "../../../js/events";

const EVENT_ID_LENGTH = 40;

jest.mock('@/engine/js/network/network-messenger.mjs', () => {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn().mockImplementation((options) => {})
    };
});

describe('Events', () => {
    describe('RaiseEvent', () => {

        Events.List.DummyEvent = "DummyEvent";
        
        function dummySubscribe() {
            const mockFunction = jest.fn();

            Events.Subscribe(Events.List.DummyEvent, mockFunction);

            return mockFunction;
        }

        it('should handle no subscriptions', () => {
            // TODO
        });
        it('should assign an eventId', () => {

            const mockFunction = dummySubscribe();

            Events.RaiseEvent(Events.List.DummyEvent, {});

            expect(mockFunction).toHaveBeenCalled();
            expect(mockFunction.mock.calls[0][0]).toBeDefined();
            expect(mockFunction.mock.calls[0][0].eventId).toBeDefined();
            // expect(typeof mockFunction.mock.calls[0][0].eventId).toBe('string');
            // expect(mockFunction.mock.calls[0][0].eventId).not.toBeNull();
            expect(mockFunction.mock.calls[0][0].eventId.length).toBe(EVENT_ID_LENGTH);
        });
    });
});
