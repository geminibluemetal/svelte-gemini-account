import { createEventStream } from "$lib";

export function GET() {
  return new Response(createEventStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
