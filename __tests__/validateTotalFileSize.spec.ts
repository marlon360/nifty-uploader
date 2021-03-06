import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';

test('file size limit reached', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        totalFileSizeLimit: 2
    });

    const file = new File(["biggerthan2bytes"], "filename");

    uploader.on('file-rejected',(data) => {
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

test('file size limit reached with multiple files', (done) => {
    // new uploader instance without options
    const uploader = new NiftyUploader({
        totalFileSizeLimit: 2
    });

    const file = new File(["1"], "filename");
    const file2 = new File(["123"], "filename");

    uploader.on('file-rejected',(data) => {
        expect(data.file.name).toBe(file2.name);
        done();
    });

    uploader.addFiles([file,file2]);
});

test('file size limit not reached with multiple files', (done) => {
    
    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance without options
    const uploader = new NiftyUploader({
        totalFileSizeLimit: 5
    });

    const file = new File(["1"], "filename");
    const file2 = new File(["123"], "filename");

    uploader.on('file-upload-started',(data) => {
        expect(data.file.name).toBe(file2.name);
        done();
    });

    uploader.addFiles([file,file2]);
});

test('file size limit not reached', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

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