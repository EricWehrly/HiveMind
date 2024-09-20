export function createMock() {
    return {
        __esModule: true, // this property makes it work
        default: jest.fn(),
    };
}
