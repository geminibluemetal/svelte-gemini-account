// src/lib/core/server/ServerBus.js
class ServerBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    // console.log(`Event on: ${event}`);
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  emit(event, data) {
    // console.log(`Event Emit: ${event}`);
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(data));
    }
  }

  // Remove a specific callback for an event
  off(event, callback) {
    if (!this.events[event]) return;

    if (callback) {
      // Remove specific callback
      this.events[event] = this.events[event].filter((cb) => cb !== callback);
    } else {
      // Remove all callbacks for this event
      delete this.events[event];
    }
  }

  // Remove all listeners for a specific event
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      // Remove all events
      this.events = {};
    }
  }

  // Get all listeners for an event
  listeners(event) {
    return this.events[event] || [];
  }
}

export const serverBus = new ServerBus();
