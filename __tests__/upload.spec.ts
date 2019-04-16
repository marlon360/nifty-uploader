import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';

test('chunk upload should succeed', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1
    });
    const file = new File(["content"], "filename");

    uploader.on('chunk-success',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
    });
    uploader.on('file-completed-successfully',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('chunk upload should fail', (done) => {

    const mockXHR = createMockXHR({
        status: 500
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.on('chunk-failed',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('chunk upload should fail because of xhr error', (done) => {

    const mockXHR = createMockXHR({
        status: 500,
        load: true
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.on('chunk-failed',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});


test('chunk upload should fail because of xhr timeout', (done) => {

    const mockXHR = createMockXHR({
        status: 500,
        load: false,
        error: true
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.on('chunk-failed',(data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('file upload without chunking should succeed', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-upload-succeeded',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('file upload without chunking should fail', (done) => {

    const mockXHR = createMockXHR({
        status: 500
    });
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-upload-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});