export type Listener<T> = (event: T) => any;

export class NiftyEvent<T> {
    private listeners: Array<Listener<T>> = [];

    // add listener to event
    public on(listener: Listener<T>) {
        this.listeners.push(listener);
    }

    // remove listener from event
    public off(listener: Listener<T>) {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) {
            this.listeners.splice(callbackIndex, 1);
        }
    }

    // trigger event
    public trigger(event: T) {

        // trigger all callbacks from listeners
        for (const listener of this.listeners) {
            listener(event);
        }
    }

}
