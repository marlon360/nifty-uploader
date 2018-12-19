import { NiftyUploader } from '../src/NiftyUploader';

const mockXHR = {
    onload: jest.fn(),
    open: jest.fn(),
    send: jest.fn(() => {
        this.onload()
    })
}

test('uploader should call xhr send', (done) => {

    (<any>window).XMLHttpRequest = jest.fn(() => mockXHR);

    // new uploader instance
    const uploader = new NiftyUploader();
    const file = new File(["content"], "filename");

    uploader.onChunkFail((data) => {
        expect(mockXHR.send).toBeCalled();
        done();
    });

    uploader.addFile(file);
    
});