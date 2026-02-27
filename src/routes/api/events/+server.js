import { createEventStream } from '$lib/core/server/sseBus';

export function GET() {
  return new Response(createEventStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
