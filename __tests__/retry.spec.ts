import { createMockXHR } from "./mocks/mockXHR";
import { NiftyUploader } from "../src/NiftyUploader";

test('chunk upload should retry and fail', (done) => {

    const mockXHR = createMockXHR(503);
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.onChunkFail((data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});