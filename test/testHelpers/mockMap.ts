interface MockMap extends jest.Mock {
    Instance: {
        GetChunk: jest.Mock;
    };
}

const mockMap: MockMap = jest.fn().mockImplementation(() => {
    return {
        GetChunk: jest.fn().mockImplementation(() => {
            return {
                equals: () => { return false; }
            };
        }),
    };
}) as MockMap;

mockMap.Instance = {
    GetChunk: jest.fn().mockImplementation(() => {
        return {
            equals: () => { return false; }
        };
    }),
};

export default {
    __esModule: true, // this property makes it work
    default: mockMap,
};
