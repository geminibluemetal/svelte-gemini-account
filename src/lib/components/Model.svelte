<script>
  import { tick, onMount, onDestroy } from 'svelte';
  import Teleport from './Teleport.svelte';

  /* props */
  let {
    open = false,
    closeOnBackdrop = true,
    closeOnEsc = true,
    children,
    trigger = false,
    onOpen = () => {},
    onClose = () => {},
    autoFocusTabIndex = 0,
    class: userClass = '',
    modelClass = '',
    ...props
  } = $props();

  /* state */
  let modalEl;
  let lastFocused;

  const focusableSelector = `
    a[href], button:not([disabled]), textarea,
    input:not([disabled]), select:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `;

  function close() {
    onClose();
    lastFocused?.focus();
  }

  async function trapFocus() {
    await tick();
    const focusables = modalEl?.querySelectorAll(focusableSelector);
    focusables?.[autoFocusTabIndex]?.focus();
  }

  function handleKeydown(e) {
    if (!open) return;

    if (e.key === 'Escape' && closeOnEsc) {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusables = modalEl.querySelectorAll(focusableSelector);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (!open) return;

    lastFocused = document.activeElement;
    trapFocus();

    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  });
</script>

<!-- Triggering -->
{#if trigger}
  <span class={userClass} {...props} onclick={onOpen}>
    {@render trigger(close)}
  </span>
{/if}

{#if open}
  <Teleport to="body">
    <div class="fixed inset-0 z-30 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" onclick={() => closeOnBackdrop && close()} />

      <!-- Modal -->
      <div
        bind:this={modalEl}
        role="dialog"
        aria-modal="true"
        class="z-10 max-h-[90vh] overflow-auto rounded-md {modelClass}"
      >
        {@render children(close)}
      </div>
    </div>
  </Teleport>
{/if}
