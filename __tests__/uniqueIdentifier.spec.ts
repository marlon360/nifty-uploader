import { NiftyUploader } from '../src/NiftyUploader';
import { NiftyFile } from '../src/NiftyFile';

test('generate unique identifier default', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        autoUpload: false,
    });
    const file = new File(["content"], "filename");

    uploader.on('file-queued',(data) => {
        const uniqueIdentifier = data.file.uniqueIdentifier;
        expect(uniqueIdentifier).toBe(file.size + "-" + file.name);
        done();
    });

    // add a test file
    uploader.addFiles([file]);
    
});

test('generate unique identifier with custom function', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        autoUpload: false,
        generateUniqueIdentifier: (file: NiftyFile) => {
            return file.name;
        }
    });
    const file = new File(["content"], "filename");

    uploader.on('file-queued',(data) => {
        const uniqueIdentifier = data.file.uniqueIdentifier;
        expect(uniqueIdentifier).toBe(file.name);
        done();
    });

    // add a test file
    uploader.addFiles([file]);
    
});

test('generate unique identifier with custom function with promise', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        autoUpload: false,
        generateUniqueIdentifier: (file: NiftyFile) => {
            return new Promise<string>((resolve, reject) => {
                setTimeout(() => {
                    resolve("promise");
                    done();
                }, 500);
            });
        }
    });
    const file = new File(["content"], "filename");

    uploader.on('file-queued',(data) => {
        const uniqueIdentifier = data.file.uniqueIdentifier;
        expect(uniqueIdentifier).toBe("promise");
    });

    // add a test file
    uploader.addFiles([file]);
    
});