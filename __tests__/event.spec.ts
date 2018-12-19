import { NiftyEvent } from "../src/NiftyEvent";

test('on event', () => {
    // create new event
    const event = new NiftyEvent<{}>();
    // define callback for event
    const callback = jest.fn();
    // add callback to event
    event.on(callback);
    // trigger event twice
    event.trigger({});
    event.trigger({});
    expect(callback).toBeCalledTimes(2);
});

test('off event', () => {
    // create new event
    const event = new NiftyEvent<{}>();
    // define callback for event
    const callback = jest.fn();
    // add callback to event
    event.on(callback);
    // trigger event
    event.trigger({});
    // remove callback from event
    event.off(callback);
    // trigger event
    event.trigger({});
    // remove event listener again should throw no error
    event.off(callback);
    // callback should only called once
    expect(callback).toBeCalledTimes(1);
});