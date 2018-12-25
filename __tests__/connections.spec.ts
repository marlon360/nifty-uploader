import { createMockXHR } from "./mocks/mockXHR";
import { NiftyUploader } from "../src/NiftyUploader";

test('too many concurrent uploads', (done) => {

    const mockXHR = createMockXHR(200, false);
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1,
        numberOfConcurrentUploads: 2
    });
    const file = new File(["content"], "filename");

    uploader.onFileUploadStarted((data) => {
        uploader.upload();
        uploader.upload();
        uploader.upload();
        uploader.upload();
        expect(true).toBeTruthy();
        done();
    });

    uploader.addFile(file);
    
    
});