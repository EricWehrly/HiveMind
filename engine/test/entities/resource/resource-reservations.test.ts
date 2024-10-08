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

    describe('available', () => {
        it('should return the value of the resource when nothing is reserved', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            expect(resource.value).toBe(9);
            expect(resource.reserved).toBe(0);
            expect(resource.available).toBe(9);
        });

        it('should return the difference between value and reserved', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            resource.reserve(5, {});
            expect(resource.available).toBe(4);
        });
    });

    // pay 
    // should take from reservation bucket if specified
    // (how are we going to verify that ... ?)
    describe('pay', () => {
        it('should take from reservation bucket if specified', () => {
    
            const fakeEntity = {
                name: 'fakey'
            };
            const resource = new Resource({
                name: 'test',
                value: 30
            });
            resource.reserve(20, fakeEntity);
            expect(resource.reserved).toBe(20);
            expect(resource['_reservations'].get(fakeEntity)).toBe(20);

            resource.pay(10, fakeEntity);
            expect(resource['_reservations'].get(fakeEntity)).toBe(10);
            expect(resource.reserved).toBe(10);

            expect(resource.value).toBe(20);
        });
    });

    describe('reserve', () => {
        it('should return false if the player cannot afford the amount', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });

            const result = resource.reserve(10, {});

            expect(result).toBe(false);
        });

        it('should increase the amount reserved', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            expect(resource.reserved).toBe(0);

            resource.reserve(5, {});
            expect(resource.reserved).toBe(5);
        });

        it('should create a bucket to store reservation', () => {

            const fakeEntity = {
                name: 'fakey'
            };
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            resource.reserve(5, fakeEntity);
            expect(resource['_reservations'].get(fakeEntity)).toBe(5);
        });

        it('should add to existing reservation bucket if specified', () => {

            const fakeEntity = {
                name: 'fakey'
            };
            const resource = new Resource({
                name: 'test',
                value: 99
            });
            // these tests might get weird, going around the total reservation variable
            resource['_reservations'].set(fakeEntity, 5);
            expect(resource['_reservations'].get(fakeEntity)).toBe(5);

            resource.reserve(20, fakeEntity);
            expect(resource['_reservations'].get(fakeEntity)).toBe(25);
        });
    });

    describe('unReserve', () => {
        it('should decrease the amount reserved', () => {
            const resource = new Resource({
                name: 'test',
                value: 9
            });
            resource.reserve(5, {});

            resource.unReserve(3, {});
            expect(resource.reserved).toBe(2);
            expect(resource.value).toBe(9);
        });

        it('should subtract from specified reservation bucket', () => {

            const fakeEntity = {
                name: 'fakey'
            };
            const resource = new Resource({
                name: 'test',
                value: 50
            });
            // these tests might get weird, going around the total reservation variable
            resource['_reservations'].set(fakeEntity, 20);
            expect(resource['_reservations'].get(fakeEntity)).toBe(20);

            resource.unReserve(10, fakeEntity);
            expect(resource['_reservations'].get(fakeEntity)).toBe(10);
        });
    });
});
