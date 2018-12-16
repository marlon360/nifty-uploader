import { NiftyUploader } from '../src/NiftyUploader';

test('test uploader default options when not specified', () => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        endpoint: "endpoint"
    });
    // file length should be 0, because no files were added
    expect(uploader.options.chunkSize).toBe(2 * 1024 * 1024);
});

test('test uploader options', () => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        chunkSize: 100,
        endpoint: "endpoint"
    });
    // file length should be 0, because no files were added
    expect(uploader.options.chunkSize).toBe(100);
});

test('test file default options when not specified', () => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        endpoint: "endpoint"
    });
    // add a test file
    uploader.addFiles([new File([], "testfile")]);
    // first file must have default options
    expect(uploader.files[0].options.chunkSize).toBe(2 * 1024 * 1024);
});

test('test file options', () => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        chunkSize: 200,
    });
    // add a test file
    uploader.addFiles([new File([], "testfile")], {
        endpoint: "endpoint",
        chunkSize: 155
    });
    // first file must have default options
    expect(uploader.files[0].options.chunkSize).toBe(155);
});

test('test file options to inherit from uploader', () => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        chunkSize: 200,
    });
    // add a test file
    uploader.addFiles([new File([], "testfile")], {
        endpoint: "endpoint"
    });
    // first file must have default options
    expect(uploader.files[0].options.chunkSize).toBe(200);
});