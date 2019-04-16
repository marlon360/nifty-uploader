import { NiftyUploader } from "../src/NiftyUploader";
import { NiftyFile } from "../src/NiftyFile";

test('file status changed event', (done) => {

    // new uploader instance
    const uploader = new NiftyUploader({
        autoQueue: true,
        chunking: false
    });
    const file = new File(["content"], "filename");

    uploader.on('file-accepted',(data) => {
        data.file.on('status-changed',() => statusChanged(data.file));
    });

    const statusChanged = (changedFile: NiftyFile) => {
        expect(changedFile.name).toBe("filename");
        changedFile.off('status-changed', () => statusChanged(changedFile));
        done();
    }

    uploader.addFile(file);
    
});