<script>
  const { class: userClass = '', trigger, content } = $props();

  let open = $state(false);
  open = true; // Should Remove these Later

  function toggle() {
    open = !open;
  }

  function show() {
    open = true;
  }

  function hide() {
    open = false;
  }

  function closeOnEscape(e) {
    if (e.key !== 'Escape') return;
    if (!open) return;
    open = false;
  }
</script>

<svelte:window on:keydown={closeOnEscape} />

<span>
  <!-- Trigger -->
  {@render trigger({ toggle, show, hide, open })}

  <!-- Dialog -->
  {#if open}
    <div class="absolute bg-black/40 w-dvw h-dvh inset-0 z-20">
      <div
        class="bg-white min-w-md absolute top-10 left-1/2 -translate-x-1/2 rounded overflow-auto {userClass}"
      >
        {@render content({ toggle, show, hide, open })}
      </div>
    </div>
  {/if}
</span>
