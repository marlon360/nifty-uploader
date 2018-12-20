import { NiftyUploader } from "../src/NiftyUploader";
import { flushPromises } from "./utils/flushPromises";
import { createMockXHR } from "./mocks/mockXHR";

describe("test lifecycle auto options (add, process, enqueu, upload)", () => {
    
    test('file should not upload if auto upload disabled', async () => {

        const mockXHR = createMockXHR();
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
    
        const file = new File(["asd"], "testfile");
        // new uploader instance
        const uploader = new NiftyUploader({
            autoUpload: false
        });
    
        let correct = false;
        uploader.onFileAdded((data) => {
            correct = true;
        });
        uploader.onFileUploadStarted((data) => {
            correct = false;
        });
    
        // add a test file
        uploader.addFile(file);
    
        await flushPromises();
    
        expect(correct).toBeTruthy();
        
    });

    test('file should upload if auto upload enabled', (done) => {

        const mockXHR = createMockXHR();
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
    
        const file = new File(["asd"], "testfile");
        // new uploader instance
        const uploader = new NiftyUploader({
            autoUpload: true
        });
    
        uploader.onFileUploadStarted((data) => {
            expect.anything();
            done();
        });
    
        // add a test file
        uploader.addFile(file);
    });
    
    
    test('file should not upload if auto processing disabled', async () => {
    
        const mockXHR = createMockXHR();
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
    
        const file = new File(["asd"], "testfile");
        // new uploader instance
        const uploader = new NiftyUploader({
            autoProcess: false
        });
    
        let correct = false;
        uploader.onFileAdded((data) => {
            correct = true;
        });
        uploader.onFileUploadStarted((data) => {
            correct = false;
        });
    
        // add a test file
        uploader.addFile(file);
    
        await flushPromises();
    
        expect(correct).toBeTruthy();
        
    });
    
    test('file should not upload if auto enqueue disabled', async () => {
    
        const mockXHR = createMockXHR();
        (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);
    
        const file = new File(["asd"], "testfile");
        // new uploader instance
        const uploader = new NiftyUploader({
            autoQueue: false
        });
    
        let correct = false;
        uploader.onFileAdded((data) => {
            correct = true;
        });
        uploader.onFileUploadStarted((data) => {
            correct = false;
        });
    
        // add a test file
        uploader.addFile(file);
    
        await flushPromises();
    
        expect(correct).toBeTruthy();
        
    });
})