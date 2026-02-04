import { writable } from 'svelte/store';

export const toasts = writable([]);

let id = 0;

export function showToast(message, type = 'success', duration = 3000) {
  const toastId = id++;

  toasts.update((t) => [...t, { id: toastId, message, type }]);

  // Optional auto-close
  if (duration > 0) {
    setTimeout(() => {
      closeToast(toastId);
    }, duration);
  }
}

export function closeToast(toastId) {
  toasts.update((items) => items.filter((toast) => toast.id !== toastId));
}
