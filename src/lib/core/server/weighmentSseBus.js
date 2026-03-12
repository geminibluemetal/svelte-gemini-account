const clients = new Set();

export function createWeighmentStream() {
  let controllerReference;

  return new ReadableStream({
    start(controller) {
      controllerReference = controller;
      clients.add(controller);

      // Send initial heartbeat
      controller.enqueue(`event: connected\ndata: weighment-stream\n\n`);
    },

    cancel() {
      // Use the reference to remove the specific controller
      clients.delete(controllerReference);
    },
  });
}

export function sendWeighment(data) {
  const payload = `data: ${data}\n\n`;

  for (const client of clients) {
    try {
      // Check if the controller is still open before enqueuing
      // The "desiredSize" is null if the stream is closed/errored
      if (client.desiredSize === null) {
        clients.delete(client);
        continue;
      }

      client.enqueue(payload);
    } catch (e) {
      // If it fails, remove the dead client so it doesn't crash the next loop
      clients.delete(client);
      console.error('Removed a dead SSE client:', e.message);
    }
  }
}
