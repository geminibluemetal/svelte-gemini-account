<script>
  import { onDestroy, onMount } from 'svelte';

  let { disabled = false, children } = $props();

  let container;
  let contentElement;

  onMount(() => {
    if (disabled) return;

    // Get the actual DOM element of the children
    // In Svelte 5, we need to find the rendered element
    contentElement = document.querySelector('[data-teleport-content]');
    if (!contentElement) return;

    // Create container and append to body
    container = document.createElement('div');
    container.setAttribute('data-teleport-container', '');
    document.body.appendChild(container);

    // Move the content to body
    container.appendChild(contentElement);
  });

  onDestroy(() => {
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  $effect(() => {
    if (disabled && container) {
      container.style.display = 'none';
    } else if (!disabled && container) {
      container.style.display = '';
    }
  });
</script>

<!-- Mark content for teleporting -->
<div data-teleport-content>
  {@render children()}
</div>
