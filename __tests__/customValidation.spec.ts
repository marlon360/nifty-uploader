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

test('custom validation: promise resolved with false', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        customValidation: ((file) => {
            return new Promise((resolve, reject) => {
                resolve(false);
            })
        })
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('processing-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('custom validation: promise rejected', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        customValidation: ((file) => {
            return new Promise((resolve, reject) => {
                reject();
            })
        })
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('processing-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('custom validation: boolean', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        customValidation: ((file) => {
            return true;
        })
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
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