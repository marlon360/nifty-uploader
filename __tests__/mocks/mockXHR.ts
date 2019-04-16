export function createMockXHR(params?: {
        status?: number,
        load?: boolean,
        error?: boolean,
        timeout?: boolean
    }) {

    let status = params && params.status ? params.status : 200;
    let load = params && params.load ? params.load : true;
    let error = params && params.error ? params.error : false;
    let timeout = params && params.timeout ? params.timeout : false;

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