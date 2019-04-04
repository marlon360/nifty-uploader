import { createMockXHR } from "./mocks/mockXHR";
import { NiftyUploader } from "../src/NiftyUploader";

test('file upload start event should be fired', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-upload-started',(data) => {
        expect.anything();
        done();
    });

    uploader.addFiles([file, file, file]);
    
});