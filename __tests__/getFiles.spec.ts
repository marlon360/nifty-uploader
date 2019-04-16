import { NiftyUploader } from '../src/NiftyUploader';
import { NiftyStatus } from '../src/NiftyStatus';

test('get files by status', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    uploader.on('file-queued',(data) => {
        // length should mow be 1
        expect(uploader.getFilesByStatus([NiftyStatus.QUEUED]).length).toBe(1);
        done();
    })

    // add a test file
    uploader.addFile(new File(["content"], "testfile"));
});

test('get files by unique identifier', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    uploader.on('file-success',(data) => {
        // length should mow be 1
        expect(uploader.getFileByUniqueIdentifier("abc-def")).toBe(data.file);
        done();
    })

    // add a test file
    uploader.addInitialFile({name: "test", uniqueIdentifier: "abc-def"});
});

test('get no file by unique identifier', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    uploader.on('file-success',(data) => {
        // length should mow be 1
        expect(uploader.getFileByUniqueIdentifier("abc")).not.toBe(data.file);
        done();
    })

    // add a test file
    uploader.addInitialFile({name: "test", uniqueIdentifier: "abc-def"});
});


