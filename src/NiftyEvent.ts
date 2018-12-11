export interface Listener<T> {
    (event: T): any;
}

export class NiftyEvent<T> {
    private listeners: Listener<T>[] = [];

    // add listener to event
    on(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    // remove listener from event
    off(listener: Listener<T>) {
        var callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
    }

    // trigger event
    trigger(event: T) {

        // trigger all callbacks from listeners
        for (let listener of this.listeners) {
            listener(event);
        }
    }

}
