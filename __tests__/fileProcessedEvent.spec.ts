import { NiftyUploader } from "../src/NiftyUploader";

test('file processed event', (done) => {

    // new uploader instance
    const uploader = new NiftyUploader({
        autoQueue: false,
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-accepted',(data) => {
        expect.anything();
        done();
    });

    uploader.addFile(file);
    
});