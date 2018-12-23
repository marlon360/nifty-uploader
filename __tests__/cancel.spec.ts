import { NiftyUploader } from '../src/NiftyUploader';
import { createMockXHR } from './mocks/mockXHR';
import { FileStatus } from '../src/NiftyStatus';

test('cancel upload', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1
    });
    const file = new File(["content"], "filename");

    uploader.onFileCanceled((data) => {
        expect(data.file.status).toBe(FileStatus.CANCELED);
        done();
    })

    uploader.onFileUploadStarted((data) => {
        data.file.cancel();
    });

    uploader.addFile(file);
    
});

test('cancel all uploads', (done) => {

    const mockXHR = createMockXHR();
    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader({
        chunkSize: 1
    });
    const file = new File(["content"], "filename");

    uploader.onFileCanceled((data) => {
        expect(data.file.status).toBe(FileStatus.CANCELED);
        done();
    })

    uploader.onFileAdded((data) => {
        uploader.cancelAll();
    });

    uploader.addFile(file);
    
});
