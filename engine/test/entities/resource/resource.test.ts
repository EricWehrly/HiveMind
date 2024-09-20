import Resource from "../../../js/entities/resource";

jest.mock('@/engine/js/events', () => {
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

describe('Resource', () => {

    describe('canAfford', () => {
        it('should return true if the player can afford the amount', () => {
            const resource = new Resource({
                name: 'test',
                value: 10
            });
            const result = resource.canAfford(10);

            expect(result).toBe(true);
        });

        it('should return false if the player cannot afford the amount', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            const result = resource.canAfford(10);

            expect(result).toBe(false);
        });

        it('should not change the value of the resource', () => {
            const resource = new Resource({
                name: 'test',
                value: 11
            });
            resource.canAfford(10);

            expect(resource.value).toBe(11);
        });
    });

    describe('pay', () => {
        it('should return false if the player cannot afford the amount', () => {
            const resource = new Resource({
                name: 'test',
                value: 11
            });
            resource.canAfford = jest.fn().mockReturnValue(false);

            const result = resource.pay(10);
            jest.restoreAllMocks();
            
            expect(result).toBe(false);
            
        });

        it('should subtract the amount from the resource value', () => {
            const resource = new Resource({
                name: 'test',
                value: 11
            });

            resource.pay(10);

            expect(resource.value).toBe(1);
        });
    });
});