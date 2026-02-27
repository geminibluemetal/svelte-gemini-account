// src\lib\core\server\sseBus.js

const clients = new Set();

/**
 * Create SSE stream
 */
export function createEventStream() {
  return new ReadableStream({
    start(controller) {
      const send = (event) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
        } catch {
          // controller already closed
          clients.delete(send);
        }
      };

      clients.add(send);

      // optional initial ping
      send({ type: 'CONNECTED' });

      return () => {
        clients.delete(send);
      };
    },
  });
}

/**
 * Emit global event
 */
export function sseEmit(event) {
  for (const send of [...clients]) {
    send(event);
  }
}
