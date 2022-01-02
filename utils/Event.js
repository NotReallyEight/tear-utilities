"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
class Event {
    constructor(event, listener, { once = false } = {}) {
        this.args = [event, listener];
        this.once = once;
    }
}
exports.Event = Event;
