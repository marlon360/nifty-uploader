import { createMockXHR } from "./mocks/mockXHR";
import { NiftyUploader } from "../src/NiftyUploader";

test('chunk upload should retry and fail', (done) => {

    const mockXHR = createMockXHR({
        status: 503
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.on('chunk-failed',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('chunk upload should retry and trigger event', (done) => {

    const mockXHR = createMockXHR({
        status: 503
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.on('chunk-retry',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('file upload should retry and trigger event', (done) => {

    const mockXHR = createMockXHR({
        status: 503
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-retry',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});