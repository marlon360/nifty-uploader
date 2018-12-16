import { NiftyUploader } from '../src/NiftyUploader';
import { NiftyFile } from '../src/NiftyFile';

test('generate unique identifier default', () => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint"
    });
    const file = new File(["content"], "filename");

    uploader.onFileQueued((data) => {
        const uniqueIdentifier = data.file.uniqueIdentifier;
        expect(uniqueIdentifier).toBe(file.size + "-" + file.name);
    });

    // add a test file
    uploader.addFiles([file]);
    
});

test('generate unique identifier with custom function', () => {
    // new uploader instance
    const uploader = new NiftyUploader({
        endpoint: "endpoint",
        generateUniqueIdentifier: (file: NiftyFile) => {
            return file.name;
        }
    });
    const file = new File(["content"], "filename");

    uploader.onFileQueued((data) => {
        const uniqueIdentifier = data.file.uniqueIdentifier;
        expect(uniqueIdentifier).toBe(file.name);
    });

    // add a test file
    uploader.addFiles([file]);
    
});