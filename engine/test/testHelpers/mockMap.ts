interface MockMap extends jest.Mock {
    Instance: {
        getChunk: jest.Mock;
    };
}

const mockMap: MockMap = jest.fn().mockImplementation(() => {
    return {
        getChunk: jest.fn().mockImplementation(() => {
            return {
                equals: () => { return false; }
            };
        }),
    };
}) as MockMap;

mockMap.Instance = {
    getChunk: jest.fn().mockImplementation(() => {
        return {
            equals: () => { return false; }
        };
    }),
};

export default {
    __esModule: true, // this property makes it work
    default: mockMap,
};
