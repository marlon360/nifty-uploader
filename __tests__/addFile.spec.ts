import { NiftyUploader } from '../src/NiftyUploader';

test('add single file to uploader', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false,
        autoProcess: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    uploader.onFileAdded((data) => {
        // length should mow be 1
        expect(uploader.files.length).toBe(1);
        done();
    })

    // add a test file
    uploader.addFile(new File(["content"], "testfile"));
});

test('add multiple file to uploader', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false,
        autoProcess: false
    });
    // file length should be 0, because no files were added
    expect(uploader.files.length).toBe(0);

    let counter = 0;
    uploader.onFileAdded((data) => {
        counter++;
        if (counter == 2) {
            // length should mow be 1
            expect(uploader.files.length).toBe(2);
            done();
        }
        
    })

    // add a test file
    uploader.addFiles([new File(["content"], "testfile"), new File(["content"], "testfile2")]);
});

test('file added event', (done) => {

    const file = new File(["content"], "testfile");
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false,
        autoProcess: false
    });

    uploader.onFileAdded((data) => {
        expect(data.file.name).toBe(file.name);
        done();
    });

    // add a test file
    uploader.addFile(file);

});