<script>
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { isElementFullyVisible, scrollToMiddle } from '$lib/core/client/visibilityCheck';
  import { onDestroy, onMount } from 'svelte';

  const {
    title = '',
    headers = [],
    items = [],
    hideSerial = false,
    hideAction = false,
    bottomSpace = true,
    moveToEnd = true
  } = $props();

  let overRow = $state(-1);
  let container = $state(null);

  const headersGridColumnsWidth = $derived(
    headers.reduce((acc, header) => {
      return header?.width ? `${acc}${header.width}px ` : `${acc}auto `;
    }, '')
  );

  const gridTemplate = $derived(
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '60px'}`
  );

  const rowUp = () => (overRow = overRow - 1 >= 0 ? overRow - 1 : overRow);
  const rowDown = () => (overRow = overRow + 1 <= items.length - 1 ? overRow + 1 : overRow);
  const gotoTop = () => (overRow = 0);
  const gotoBottom = () => (overRow = items.length - 1);
  const jump20Top = () => (overRow = overRow - 20 >= 0 ? overRow - 20 : overRow);
  const jump20Bottom = () => (overRow = overRow + 20 <= items.length - 1 ? overRow + 20 : overRow);

  $effect(() => {
    const overRowElement = document.querySelector(`[data-over-row="${overRow}"]`);
    if (!isElementFullyVisible(overRowElement, container, { top: 50 })) {
      scrollToMiddle(overRowElement, container);
    }
  });

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }
    keyboardEventBus.on('ArrowUp', rowUp);
    keyboardEventBus.on('ArrowDown', rowDown);
    keyboardEventBus.on('Home', gotoTop);
    keyboardEventBus.on('End', gotoBottom);
    keyboardEventBus.on('PageUp', jump20Top);
    keyboardEventBus.on('PageDown', jump20Bottom);
  });

  onDestroy(() => {
    keyboardEventBus.off('ArrowUp', rowUp);
    keyboardEventBus.off('ArrowDown', rowDown);
    keyboardEventBus.off('Home', gotoTop);
    keyboardEventBus.off('End', gotoBottom);
    keyboardEventBus.off('PageUp', jump20Top);
    keyboardEventBus.off('PageDown', jump20Bottom);
  });
</script>

<div class="p-2 h-screen flex flex-col w-fit">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div class="overflow-auto border-2 border-black" bind:this={container}>
    <!-- ONE GRID -->
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <!-- TITLE ROW -->
      <div
        class="col-span-full bg-red-700 text-white text-center font-bold border-b-2 border-white sticky top-0 flex"
      >
        <div class="flex-1 text-left"></div>
        <div class="flex-1 text-center">{title}</div>
        <div class="flex-1 text-right"></div>
      </div>

      <!-- HEADER -->
      {#if !hideSerial}
        <div
          class="sticky top-6.5 z-20 bg-black text-white border-r-2 border-white text-center px-1"
        >
          SN
        </div>
      {/if}

      {#each headers as header, index (index)}
        <div
          class="sticky top-6.5 z-20 bg-black text-white border-r-2 border-white text-center px-1"
        >
          {header.name}
        </div>
      {/each}

      {#if !hideAction}
        <div class="sticky top-6.5 z-20 bg-black text-white text-center px-1">Action</div>
      {/if}

      <!-- BODY -->
      {#each items as item, row (row)}
        {#if !hideSerial}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_mouse_events_have_key_events -->
          <div
            class="border-r border-b px-1 border-gray-500 text-center
            {overRow == row ? 'bg-black/20' : 'bg-white'}"
            onmousemove={() => (overRow = row)}
            data-over-row={row}
          >
            {row + 1}
          </div>
        {/if}

        {#each headers as header, col (col)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_mouse_events_have_key_events -->
          <div
            class="border-r border-b px-1 border-gray-500
            {header?.align ? `text-${header.align}` : 'text-left'}
            {overRow == row ? 'bg-black/20' : 'bg-white'}"
            onmousemove={() => (overRow = row)}
          >
            {item[header.key]}
          </div>
        {/each}

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        {#if !hideAction}
          <div
            class="border-b px-1 border-gray-500 text-center
          {overRow == row ? 'bg-black/20' : 'bg-white'}"
            onmousemove={() => (overRow = row)}
          ></div>
        {/if}
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[50dvh]"></div>
      {/if}
    </div>
  </div>
</div>
