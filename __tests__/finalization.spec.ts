import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';

test('file finalization should succeed', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false,
        finalization: (file) => {
            return Promise.resolve();
        }
    });
    const file = new File(["content"], "filename");

    uploader.on('file-success',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('file finalization should fail', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunking: false,
        finalization: (file) => {
            return Promise.reject();
        }
    });
    const file = new File(["content"], "filename");

    uploader.on('file-failed',(data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});