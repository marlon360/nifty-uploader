import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';

test('file progress event', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1
    });
    const file = new File(["content"], "filename");

    uploader.onFileProgress((data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});

test('chunk progress event', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1
    });
    const file = new File(["content"], "filename");

    uploader.onChunkProgress((data) => {
        expect(data.chunk.file.name).toBe(file.name);
        done();
    });

    uploader.addFile(file);
    
});