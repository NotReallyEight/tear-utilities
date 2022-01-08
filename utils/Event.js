"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(event, listener, { once = false } = {}) {
        this.event = event;
        this.listener = listener;
        this.once = once;
    }
}
exports.Event = Event;
