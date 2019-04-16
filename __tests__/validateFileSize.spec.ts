import { NiftyUploader } from '../src/NiftyUploader';

test('file is too big', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        maxFileSize: 2
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.on('file-rejected', (data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('custom error message', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        maxFileSize: 2,
        fileTooBigError: (size, max) => {
            return "Max: " + max;
        }
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.on('file-rejected', (data) => {
        expect(data.error).toBe("Max: "+2);
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

    uploader.on('file-upload-started', (data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});