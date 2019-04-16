import { NiftyUploader } from '../src/NiftyUploader';

test('file progress event', (done) => {

    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false,
    });
    const file = new File(["content"], "filename");

    uploader.on('file-queued',(data) => {
        expect(uploader.getProgress()).toBe(0);
        done();
    });

    uploader.addFile(file);
    uploader.addFile(file);
    
});