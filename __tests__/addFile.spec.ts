import { NiftyUploader } from '../src/NiftyUploader';

test('add file to uploader', () => {
    // new uploader instance
    const uploader = new NiftyUploader();
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);
    // add a test file
    uploader.addFiles([new File([], "testfile")]);
    // length should mow be 1
    expect(uploader.files.length).toBe(1);
});