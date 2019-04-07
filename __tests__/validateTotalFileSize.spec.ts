import { NiftyUploader } from '../src/NiftyUploader';

test('file size limit reached', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        totalFileSizeLimit: 2
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.on('processing-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addInitialFile({
        name: "test",
        uniqueIdentifier: "asdas",
        size: 1
    });

    uploader.addFile(file);
});

test('file size limit not reached', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        totalFileSizeLimit: 100
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.on('file-upload-started',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});