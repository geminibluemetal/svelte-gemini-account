// src\routes\api\weighment\+server.js

import { createWeighmentStream } from '$lib/core/server/weighmentSseBus';

export function GET() {
  return new Response(createWeighmentStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
