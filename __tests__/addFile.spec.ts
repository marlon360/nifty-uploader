import { NiftyUploader } from '../src/NiftyUploader';

test('add single file to uploader', () => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        autoUpload: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);
    // add a test file
    uploader.addFile(new File([], "testfile"));
    // length should mow be 1
    expect(uploader.files.length).toBe(1);
});

test('add multiple file to uploader', () => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        autoUpload: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);
    // add a test file
    uploader.addFiles([new File([], "testfile"), new File([], "testfile2")]);
    // length should mow be 1
    expect(uploader.files.length).toBe(2);
});