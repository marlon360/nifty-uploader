export const createMockXHR = (status: number = 200) => {
    const mockXHR = {
        onload: jest.fn(),
        open: jest.fn(),
        send: jest.fn(function () {
            this.onload()
        }),
        status:  status
    }
    return mockXHR;
}