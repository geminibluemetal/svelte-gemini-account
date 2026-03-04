import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

/**
 * Updates the URL search parameters without a full page reload.
 * @param {Object} params - Key-value pairs to update. Set a value to null/undefined to remove it.
 */
export function updateParams(params) {
  // 1. Get current URL from the page store
  const url = new URL(get(page).url);

  // 2. Modify the params
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });

  // 3. Navigate smoothly
  // eslint-disable-next-line svelte/no-navigation-without-resolve
  goto(url.href, {
    replaceState: true, // Prevents flooding browser history
    noScroll: true, // Stops the page from jumping to the top
    keepFocus: true, // Keeps the cursor in the input if typing
  });
}
