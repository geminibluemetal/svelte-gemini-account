<script>
  const { overRowRect = null } = $props();

  let position = $state('bottom');
  let topPositioin = $state(0);
  let popupElement = $state(null);

  function reUpdatePosition() {
    const popupRect = popupElement?.getBoundingClientRect();
    const halfSplit = screen.availHeight / 2;
    if (overRowRect) {
      position = overRowRect.top < halfSplit ? 'top' : 'bottom';
      topPositioin =
        overRowRect.top < halfSplit
          ? overRowRect.top + 35
          : overRowRect.top - popupRect.height - 10;
    }
  }

  $effect(() => {
    reUpdatePosition();
  });
</script>

<div class="absolute left-1/3 z-50 w-md" style:top={`${topPositioin}px`} bind:this={popupElement}>
  <div class="rounded-lg bg-white p-3 shadow-[0_0_20px_10px_rgba(0,0,0,0.3)]">
    Lorem ipsum dolor sit amet consectetur, adipisicing elit. At, minima totam! Dignissimos expedita
    quis ratione provident odio cumque et sed eaque. Est doloremque harum nesciunt et nihil,
  </div>
  {#if position == 'top'}
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-10 border-transparent border-t-white border-l-white shadow-[-15px_-15px_15px_5px_rgba(0,0,0,0.1)]"
    ></div>
  {:else}
    <div
      class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 border-10 border-transparent border-r-white border-b-white shadow-[15px_15px_15px_5px_rgba(0,0,0,0.1)]"
    ></div>
  {/if}
</div>
