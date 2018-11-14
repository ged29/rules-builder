type TCachedItem = { fn: (...args) => any, ctx: Object };

export class EventEmitter {
    eventsCache: { [id: string]: TCachedItem[] } = {};
    /**
      * Subscribe to an event.
      * @param event the name of the event to subscribe to
      * @param callback the function to call when event is emitted
      * @param context (OPTIONAL) - the context to bind the event callback to
      */
    on(event: string, callback: (...args) => any, context: object = null, isHighPriority: boolean = false): this {
        var items: TCachedItem[] = this.eventsCache[event] || (this.eventsCache[event] = []),
            item = { fn: callback, ctx: context };
        //prevent to subscribe twice
        for (let ii = items.length; ii--;) {
            if (items[ii].fn === callback && items[ii].ctx === context) {
                return this;
            }
        }

        if (isHighPriority) { // if it's a high priority item it should be added at the beginning of callbacks 
            items.unshift(item);
        }
        else {
            items.push(item);
        }

        return this;
    }
    /**
      * Subscribe to an event only once.
      * @param event the name of the event to subscribe to
      * @param callback the function to call when event is emitted
      * @param context (OPTIONAL) the context to bind the event callback to      
      */
    once(event: string, callback: (...args) => any, context: object = null, isHighPriority: boolean = false): this {
        (callback as any).isOneOff = true;
        return this.on(event, callback, context, isHighPriority);
    }
    /**
      * Trigger a named event.
      * @param event  the event name to emit
      * @param args (OPTIONAL) - any number of arguments to pass to callback function
      */
    emit(event: string, ...args): this {
        var items: TCachedItem[] = this.eventsCache[event];

        if (!items) {
            return this;
        }

        for (let inx = 0, len = items.length; inx < len; inx++) {
            let item = items[inx];
            item.fn.apply(item.ctx, args);
            if ((item.fn as any).isOneOff) {
                this.off(event, item.fn);
            }
        }

        return this;
    }
    /**
      * Unsubscribe from an event.
      * If no callback is provided, it unsubscribes from the given event.
      * @param event  the name of the event to unsubscribe from
      * @param callback (OPTIONAL) - the function used when binding to the event
      */
    off(event: string): this;
    off(event: string, callback?: (...args) => any): this;
    off(event: string, callback?: (...args) => any): this {
        var items: TCachedItem[] = this.eventsCache[event];

        if (!items) {
            return this;
        }

        if (callback) {
            for (let ii = items.length; ii--;) {
                if (items[ii].fn === callback) {
                    items.splice(ii, 1);
                }
            }
        }

        if ((callback && !items.length) || !callback) {
            delete this.eventsCache[event];
        }

        return this;
    }
    /**
      * Unsubscribe from all events at once.
      */
    allOff() {
        this.eventsCache = {};
    }
}