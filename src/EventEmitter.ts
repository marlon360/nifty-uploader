export class EventEmitter {

    private events: { [eventName: string]: Array<(...args: any) => void> } = {};

    public on(eventName: string, fn: (...args: any) => void) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(fn);
    }

    public off(eventName: string, fn: () => void) {
        this.events[eventName] = this.events[eventName].filter((eventFn) => {
            return fn !== eventFn;
        });
    }

    public emit(eventName: string, data?: any) {
        const event = this.events[eventName];
        if (event) {
            event.forEach((fn) => {
                fn.call(null, data);
            });
        }
    }

}
