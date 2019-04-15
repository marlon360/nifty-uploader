import { NiftyUploader } from '../src/NiftyUploader';

test('set meta data', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false
    });

    type MetaType = {
        myType: string;
    };

    uploader.on('processing-success', (data) => {
        const file = uploader.getFileByUniqueIdentifier<MetaType>("abc");
        if (file) {
            file.meta = {
                title: "Title"
            }
            expect(file.meta.title).toBe("Title");
            file.setMeta({
                myType: "Hello"
            })
            expect(file.meta.title).toBe("Title");
            expect(file.meta.myType).toBe("Hello");
            done();
        }
    });

    // add a test file
    uploader.addFile(new File(["content"], "testfile"), {
        generateUniqueIdentifier: (file) => {
            return "abc"
        }
    });

});

test('meta title is file name', (done) => {
    // new uploader instance
    const uploader = new NiftyUploader({
        autoUpload: false
    });

    uploader.on('processing-success', (data) => {
        expect(data.file.meta.title).toBe(data.file.name);
        done();

    });

    // add a test file
    uploader.addFile(new File(["content"], "testfile"));

});