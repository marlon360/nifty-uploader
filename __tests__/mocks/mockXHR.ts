export const createMockXHR = (status: number = 200, load = true, error: boolean = false, timeout: boolean = false) => {
    const mockXHR = {
        onload: jest.fn(),
        onerror: jest.fn(),
        ontimeout: jest.fn(),
        open: jest.fn(),
        send: jest.fn(function () {
            if (error) {
                this.onerror();
            } else if (timeout) {
                this.ontimeout();
            } else if (load) {
                this.onload();
            }
        }),
        status: status,
        abort: jest.fn(),
        setRequestHeader: jest.fn()
    }
    return mockXHR;
}