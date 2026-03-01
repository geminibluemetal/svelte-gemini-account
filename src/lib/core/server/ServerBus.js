// src\lib\core\server\ServerBus.js
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
}

export const serverBus = new ServerBus();
