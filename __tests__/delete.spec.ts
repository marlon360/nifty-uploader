import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';

test('file delete success', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        delete: {
            endpoint: '/delete.php',
            requestParameter: {
                myParameter: 'value'
            },
            customHeaders: {
                auth: "Bearer 324"
            }
        },
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-completed-successfully',(data) => {
        data.file.delete();
    });

    uploader.on('file-deleted',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file, {
        delete: {
            endpoint: undefined,
            method: undefined
        }
    });
    
});
test('file delete fail', (done) => {

    let mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-completed-successfully',(data) => {
        mockXHR = createMockXHR(500);
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
        data.file.delete();
    });

    uploader.on('file-deletion-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('file delete fail with xhr error', (done) => {

    let mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-completed-successfully',(data) => {
        mockXHR = createMockXHR(500, false, true);
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
        data.file.delete();
    });

    uploader.on('file-deletion-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});