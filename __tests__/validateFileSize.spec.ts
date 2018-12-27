import { NiftyUploader } from '../src/NiftyUploader';

test('file is too big', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        maxFileSize: 2
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.onFileProcessingFailed((data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file is not too big', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        maxFileSize: 100
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.onFileUploadStarted((data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});