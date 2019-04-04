import { EventEmitter } from '../src/EventEmitter';
import { NiftyUploader } from '../src/entry';

test("event emitter listening", () => {

    let emitter = new EventEmitter();
    // define callback for event
    const callback = jest.fn();
    // add callback to event
    emitter.on('test', callback);
    // trigger event twice
    emitter.emit('test');
    emitter.emit('test');
    expect(callback).toBeCalledTimes(2);

})

test("event emitter not listening", () => {

    let emitter = new EventEmitter();
    // define callback for event
    const callback = jest.fn();
    // add callback to event
    emitter.on('test', callback);
    emitter.emit('test');
    emitter.off('test', callback);
    emitter.emit('test');
    expect(callback).toBeCalledTimes(1);
})

test("event emitter on uploader", () => {

    let uploader = new NiftyUploader();
    // define callback for event
    const callback = jest.fn();
    // add callback to event
    uploader.on('file-added', callback);
    uploader.emit('file-added');
    uploader.off('file-added', callback);
    uploader.emit('file-added');
    expect(callback).toBeCalledTimes(1);
})

