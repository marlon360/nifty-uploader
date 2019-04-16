import { NiftyUploader } from '../src/NiftyUploader';

test('file type allowed: extension with dot', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            ".jpg"
        ]
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type allowed: empty array', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: []
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type allowed: empty array', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: []
    });

    const file = new File(["content"], "filename.jpg");

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type allowed: mime type', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            "image/png"
        ]
    });

    const file = new File(["content"], "filename.png", {type: "image/png"});

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type not allowed: mime type', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            "image/png",
            "image/jpg"
        ]
    });

    const file = new File(["content"], "filename.mp4", {type: "video/mp4"});

    uploader.on('file-rejected',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type allowed: mime wildcard', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            "image/*"
        ]
    });

    const file = new File(["content"], "filename.png", {type: "image/png"});

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type not allowed: mime wildcard', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            "image/*"
        ]
    });

    const file = new File(["content"], "filename.mp4", {type: "video/mp4"});

    uploader.on('file-rejected',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});

test('file type allowed: mime subtype without extension', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        autoUpload: false,
        allowedFileTypes: [
            "png"
        ]
    });

    const file = new File(["content"], "filename", {type: "image/png"});

    uploader.on('file-queued',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
});