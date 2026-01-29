// src/lib/core/client/sseReceiver.js

import { invalidate } from '$app/navigation';

let source = null;

/** Event types that should trigger SvelteKit invalidation */
const triggerables = new Set();

/** Event type → callback */
const receivables = Object.create(null);

/**
 * Start the SSE connection (idempotent)
 */
export function startSSE() {
  if (source) return;

  source = new EventSource('/api/events');

  source.onopen = () => {
    console.log('SSE connection successful');
  };

  source.onmessage = (e) => {
    let event;

    try {
      event = JSON.parse(e.data);
    } catch {
      console.error('Invalid SSE payload', e.data);
      return;
    }

    console.log(`SSE event: ${event.type}`);

    // Trigger SvelteKit invalidate
    if (triggerables.has(event.type)) {
      invalidate(event.type);
    }

    // Call registered callback (if any)
    receivables[event.type]?.(event);
  };

  source.onerror = () => {
    console.warn('SSE connection lost');
  };
}

/**
 * Register an event type for invalidate()
 */
export function syncOn(type) {
  triggerables.add(type);
}

/**
 * Remove invalidate() trigger
 */
export function syncOff(type) {
  triggerables.delete(type);
}

/**
 * Register a callback for an event type
 */
export function updatesOn(type, callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('updatesOn callback must be a function');
  }

  receivables[type] = callback;
}

/**
 * Remove callback for an event type
 */
export function updatesOff(type) {
  delete receivables[type];
}

/**
 * Stop the SSE connection
 */
export function stopSSE() {
  source?.close();
  source = null;
}
