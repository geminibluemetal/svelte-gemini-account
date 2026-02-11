<script module>
  import { untrack } from 'svelte';
  // Shared state across all instances
  let modalStack = $state([]);
</script>

<script>
  import { tick } from 'svelte';
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
  let modalEl = $state();
  let lastFocused;
  const instanceId = Symbol('modal-id');

  const focusableSelector = `
    a[href], button:not([disabled]), textarea,
    input:not([disabled]), select:not([disabled]),
    [tabindex]:not([tabindex="-1"])
  `;

  function close() {
    onClose();
    setTimeout(() => {
      lastFocused?.focus();
    }, 0);
  }

  async function trapFocus() {
    await tick();
    const focusables = modalEl?.querySelectorAll(focusableSelector);
    if (focusables?.length) {
      focusables[autoFocusTabIndex]?.focus();
    }
  }

  function handleKeydown(e) {
    if (!open) return;

    // Use untrack here to check the stack without creating a dependency
    const isTop = untrack(() => modalStack[modalStack.length - 1] === instanceId);
    if (!isTop) return;

    if (e.key === 'Escape' && closeOnEsc) {
      e.preventDefault();
      e.stopImmediatePropagation();
      close();
    }

    if (e.key !== 'Tab') return;
    const focusables = modalEl.querySelectorAll(focusableSelector);
    if (!focusables.length) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (open) {
      // 1. Add to stack (Untracked to prevent infinite loop)
      untrack(() => {
        modalStack.push(instanceId);
      });

      lastFocused = document.activeElement;
      trapFocus();

      document.addEventListener('keydown', handleKeydown, { capture: true });
      document.body.style.overflow = 'hidden';

      return () => {
        // 2. Remove from stack
        untrack(() => {
          modalStack = modalStack.filter((id) => id !== instanceId);
        });

        document.removeEventListener('keydown', handleKeydown, { capture: true });

        if (untrack(() => modalStack.length === 0)) {
          document.body.style.overflow = '';
        }
      };
    }
  });
</script>

{#if trigger}
  <span class={userClass} {...props} onclick={onOpen} role="button" tabindex="0">
    {@render trigger(close)}
  </span>
{/if}

{#if open}
  <Teleport to="body">
    <div
      class="fixed inset-0 flex items-center justify-center"
      style="z-index: {1000 + modalStack.indexOf(instanceId)}"
    >
      <div class="absolute inset-0 bg-black/50" onclick={() => closeOnBackdrop && close()}></div>

      <div
        bind:this={modalEl}
        role="dialog"
        aria-modal="true"
        class="z-10 max-h-[90vh] overflow-auto rounded-md bg-white shadow-xl {modelClass}"
      >
        {@render children(close)}
      </div>
    </div>
  </Teleport>
{/if}
