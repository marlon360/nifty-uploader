import { NiftyUploader } from '../src/NiftyUploader';

test('custom beforeProcess function', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false,
        beforeProcess: (file) => {
            throw new Error("Error");
        }
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    uploader.on('processing-failed',(data) => {
        // length should mow be 1
        expect(data.error).toBe("Error");
        done();
    })

    // add a test file
    uploader.addFile(new File(["content"], "testfile"));
});