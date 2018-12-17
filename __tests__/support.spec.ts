import { NiftyUploader } from '../src/NiftyUploader';

const slice = Blob.prototype.slice;

test('tell whether the environment support file system', () => {
    (Blob.prototype.slice as any) = undefined;
    // new uploader instance
    const uploader = new NiftyUploader();
    const isSupport = uploader.isSupport;
    expect(isSupport).toBe(false);
});

test('tell whether the environment support file system', () => {
    Blob.prototype.slice = slice;
    // new uploader instance
    const uploader = new NiftyUploader();
    const isSupport = uploader.isSupport;
    expect(isSupport).toBe(true);
});