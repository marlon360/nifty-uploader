export const createMockXHR = (status: number = 200, load = true, error: boolean = false, timeout: boolean = false) => {
    const mockXHR = {
        onload: jest.fn(),
        onerror: jest.fn(),
        ontimeout: jest.fn(),
        upload: {
            onprogress: jest.fn(),
        },
        open: jest.fn(),
        send: jest.fn(function () {
            if (error) {
                this.onerror();
            } else if (timeout) {
                this.ontimeout();
            } else if (load) {
                this.upload.onprogress(progressEventWithLength);
                this.upload.onprogress(progressEventWithoutLength);
                this.upload.onprogress(progressEventWithoutLengthAndWithoutLoaded);
                this.onload();
            }
        }),
        status: status,
        abort: jest.fn(),
        setRequestHeader: jest.fn()
    }
    return mockXHR;
}

const progressEventWithLength = {
    lengthComputable: true,
    loaded: 50,
    total: 100
}
const progressEventWithoutLength = {
    lengthComputable: false,
    loaded: 50,
    total: 100
}
const progressEventWithoutLengthAndWithoutLoaded = {
    lengthComputable: false
}