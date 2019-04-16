import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';
import { NiftyStatus } from '../src/entry';

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

    uploader.on('file-completed-successfully', (data) => {
        data.file.delete();
    });

    uploader.on('file-deleted', (data) => {
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

    uploader.on('file-completed-successfully', (data) => {
        mockXHR = createMockXHR({
            status: 500,
            response: {
                error: "Error Message"
            }
        });
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
        data.file.delete();
    });

    uploader.on('file-delete-failed', (data) => {
        data.file.delete();
        expect(data.file.name).toBe(file.name);
        expect(data.error).toBe("Error Message");
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

    uploader.on('file-completed-successfully', (data) => {
        mockXHR = createMockXHR({
            status: 500,
            load: false,
            error: true
        });
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
        data.file.delete();
    });

    uploader.on('file-delete-failed', (data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);

});