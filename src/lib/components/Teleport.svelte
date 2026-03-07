<script>
  import { onMount } from 'svelte';

  let { disabled = false, children } = $props();

  let container;
  let content;

  onMount(() => {
    if (disabled) return;

    // Create container
    container = document.createElement('div');
    container.setAttribute('data-teleport-container', '');

    // Append to body immediately
    document.body.appendChild(container);

    // Manually move the content to the container
    if (content) {
      // Move the content's DOM nodes to the container
      while (content.firstChild) {
        container.appendChild(content.firstChild);
      }
    }

    // Return cleanup function
    return () => {
      if (container && container.parentNode) {
        // Move content back if needed
        if (content && container.children.length > 0) {
          while (container.firstChild) {
            // eslint-disable-next-line svelte/no-dom-manipulating
            content.appendChild(container.firstChild);
          }
        }
        container.parentNode.removeChild(container);
      }
    };
  });
</script>

<!-- This div acts as a placeholder and reference point -->
<div bind:this={content} style="display: none;">
  {@render children()}
</div>
