<script>
  import { onMount } from 'svelte';

  /* ---------- PROPS ---------- */
  const {
    trigger,
    children,
    class: userClass = '',
    popoverClass = '',
    position = 'top-center',
    show = false,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    onClose = () => {},
    ...props
  } = $props();

  let container;
  let popoverElement;

  /* ---------- POSITION MAPS ---------- */
  const positionConfig = {
    'top-left': 'bottom-full mb-2',
    'top-center': 'bottom-full mb-2 -translate-x-1/2 left-1/2',
    'top-right': 'bottom-full mb-2 right-0',
    'bottom-left': 'top-full mt-2',
    'bottom-center': 'top-full mt-2 -translate-x-1/2 left-1/2',
    'bottom-right': 'top-full mt-2 right-0'
  };

  const svgConfig = {
    'top-left': '-bottom-2 left-4',
    'top-center': '-bottom-2 left-1/2 -translate-x-1/2',
    'top-right': '-bottom-2 right-4',
    'bottom-left': '-top-2 rotate-180 left-4',
    'bottom-center': '-top-2 rotate-180 left-1/2 -translate-x-1/2',
    'bottom-right': '-top-2 rotate-180 right-4'
  };

  function handleClickOutside(event) {
    if (!closeOnOutsideClick || !show) return;

    // Check if click is outside both container and popover
    const isOutside =
      !container.contains(event.target) &&
      (!popoverElement || !popoverElement.contains(event.target));

    if (isOutside) {
      onClose();
    }
  }

  function handleEscapeKey(event) {
    if (closeOnEscape && show && event.key === 'Escape') {
      onClose();
    }
  }

  // Handle outside clicks and escape key
  $effect(() => {
    if (show) {
      // Focus the first input element when popover opens
      setTimeout(() => {
        const input = popoverElement?.querySelector('input, button');
        input?.focus();
      }, 0);

      // Add event listeners
      if (closeOnOutsideClick) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
      }

      // Cleanup function
      return () => {
        if (closeOnOutsideClick) {
          document.removeEventListener('mousedown', handleClickOutside);
        }
        if (closeOnEscape) {
          document.removeEventListener('keydown', handleEscapeKey);
        }
      };
    }
  });
</script>

<!-- ---------- WRAPPER ---------- -->
<div class="relative inline-block {userClass}" bind:this={container} {...props}>
  {@render trigger()}

  {#if show}
    <div
      class="
        absolute z-40 p-2 rounded-md shadow-lg
        bg-white dark:bg-amber-950
        {positionConfig[position]} {popoverClass}
      "
      bind:this={popoverElement}
    >
      <!-- ---------- ARROW ---------- -->
      <svg class="absolute {svgConfig[position]}" width="16" height="8" viewBox="0 0 16 8">
        <path
          d="M0 0 L8 8 L16 0 Z"
          class="fill-white dark:fill-amber-950"
          filter={position.startsWith('top')
            ? 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.2))'
            : undefined}
        />
      </svg>

      {@render children()}
    </div>
  {/if}
</div>
