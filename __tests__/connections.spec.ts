import { createMockXHR } from "./mocks/mockXHR";
import { NiftyUploader } from "../src/NiftyUploader";

test('too many concurrent uploads', (done) => {

    const mockXHR = createMockXHR({
        status: 200,
        load: true
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1,
        numberOfConcurrentUploads: 2
    });
    const file = new File(["content123456789"], "filename");
    const file2 = new File(["content123456789"], "filename");

    uploader.on('file-upload-started',(data) => {
        uploader.upload();
        uploader.upload();
        uploader.upload();
        uploader.upload();
        expect(true).toBeTruthy();
        done();
    });

    uploader.on('chunk-progress',(data) => {
        uploader.upload();
        uploader.upload();
    });

    uploader.addFiles([file, file2]);
    
    
});