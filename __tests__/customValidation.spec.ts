import { NiftyUploader } from '../src/NiftyUploader';

test('custom validation: promise resolved', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        customValidation: ((file) => {
            return new Promise((resolve, reject) => {
                resolve();
            })
        })
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('custom validation: promise rejected', (done) => {
    const errorMsg = "error";
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        customValidation: ((file) => {
            return new Promise((resolve, reject) => {
                reject(errorMsg);
            })
        })
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-rejected',(data) => {
        expect(data.file.name).toBe(file.name);
        expect(data.error).toBe(errorMsg);
        done();
    });

    uploader.addFile(file);
});

test('custom validation: no validation', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});