<script>
  import display from '$lib/core/client/display';
  import { keyboardEventBus } from '$lib/core/client/eventBus';
  import { isElementFullyVisible, scrollToMiddle } from '$lib/core/client/visibilityCheck';
  import { SearchX, Table, Table2, TableProperties } from 'lucide-svelte';
  import { onDestroy, onMount } from 'svelte';

  const {
    title = '',
    headers = [],
    items = [],
    headerColor = 'red',
    autoHight = false,
    hideSerial = false,
    hideAction = true,
    bottomSpace = false,
    moveToEnd = false,
    customEvents = [],
    rowHighlight = () => {},
    customCellHighlight = () => {},
    sidebar = () => {},
    right = () => {},
    left = () => {}
  } = $props();

  let overRow = $state(-1);
  let container = $state(null);

  // Use a Map to store handlers by key
  let customHandlersMap = $state(new Map());

  const headersGridColumnsWidth = $derived(
    headers.reduce((acc, header) => {
      return header?.width ? `${acc}${header.width}px ` : `${acc}auto `;
    }, '')
  );

  const gridTemplate = $derived(
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '60px'}`
  );

  // Navigation functions
  const rowUp = () => (overRow = overRow - 1 >= 0 ? overRow - 1 : overRow);
  const rowDown = () => (overRow = overRow + 1 <= items.length - 1 ? overRow + 1 : overRow);
  const gotoTop = () => (overRow = 0);
  const gotoBottom = () => (overRow = items.length - 1);
  const jump20Top = () => (overRow = overRow - 20 >= 0 ? overRow - 20 : overRow);
  const jump20Bottom = () => (overRow = overRow + 20 <= items.length - 1 ? overRow + 20 : overRow);

  $effect(() => {
    const overRowElement = document.querySelector(`[data-over-row="${overRow}"]`);
    if (overRowElement && !isElementFullyVisible(overRowElement, container, { top: 50 })) {
      scrollToMiddle(overRowElement, container);
    }
  });

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }

    // Register navigation events
    keyboardEventBus.on('ArrowUp', rowUp);
    keyboardEventBus.on('ArrowDown', rowDown);
    keyboardEventBus.on('Home', gotoTop);
    keyboardEventBus.on('End', gotoBottom);
    keyboardEventBus.on('PageUp', jump20Top);
    keyboardEventBus.on('PageDown', jump20Bottom);

    // Register custom events
    const handlersMap = new Map();
    customEvents.forEach(({ key, handler }) => {
      const wrappedHandler = () => {
        if (overRow >= 0 && overRow < items.length) {
          handler(items[overRow]);
        }
      };

      handlersMap.set(key, wrappedHandler);
      keyboardEventBus.on(key, wrappedHandler);
    });

    customHandlersMap = handlersMap;
  });

  onDestroy(() => {
    // Unregister navigation events
    keyboardEventBus.off('ArrowUp', rowUp);
    keyboardEventBus.off('ArrowDown', rowDown);
    keyboardEventBus.off('Home', gotoTop);
    keyboardEventBus.off('End', gotoBottom);
    keyboardEventBus.off('PageUp', jump20Top);
    keyboardEventBus.off('PageDown', jump20Bottom);

    // Unregister custom events
    customHandlersMap.forEach((handler, key) => {
      keyboardEventBus.off(key, handler);
    });
    customHandlersMap.clear();
  });
</script>

<div class="p-2 {autoHight ? 'h-full' : 'h-screen'} flex flex-row w-fit gap-2">
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_mouse_events_have_key_events -->
  <div class="overflow-auto border-2 border-black" bind:this={container}>
    <!-- ONE GRID -->
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <!-- TITLE ROW -->
      <div
        class="col-span-full text-white text-center font-bold border-b-2 border-white sticky top-0 flex
        {headerColor == 'blue' ? 'bg-blue-700' : 'bg-red-700'}"
      >
        <div class="flex-1 text-left flex">{@render left()}</div>
        <div class="flex-1 text-center">{title}</div>
        <div class="flex-1 text-right">{@render right()}</div>
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
          class="sticky top-6.5 z-20 bg-black text-white border-white text-center px-1
          {hideAction && index == headers.length - 1 ? 'border-r-0' : 'border-r-2'}"
        >
          {header.name}
        </div>
      {/each}

      {#if !hideAction}
        <div class="sticky top-6.5 z-20 bg-black text-white text-center px-1">Action</div>
      {/if}

      {#if items.length == 0}
        <div class="col-span-full font-bold h-20 flex justify-center items-center">
          <span class="text-gray-500">
            <SearchX class="inline" /> No Data Found
          </span>
        </div>
      {:else}
        <!-- BODY -->
        {#each items as item, row (row)}
          {@const rowColor = rowHighlight(item)}
          {@const groupColor = customCellHighlight(item)}
          {#if !hideSerial}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            <div
              class="border-r border-b px-1 border-gray-500 text-center
                {overRow == row ? 'bg-black/20' : rowColor?.background}"
              onmousemove={() => (overRow = row)}
            >
              {row + 1}
            </div>
          {/if}

          {#each headers as header, col (col)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_mouse_events_have_key_events -->
            {@const color = header?.color ? header.color(item[header.key], item) : null}
            <div
              class="border-b px-1 border-gray-500
                {hideAction && col == headers.length - 1 ? 'border-r-0' : 'border-r'}
                {header?.align ? `text-${header.align}` : 'text-left'}
                {color?.background
                ? color?.background
                : groupColor?.background && groupColor?.cells.includes(col)
                  ? groupColor?.background
                  : rowColor?.background
                    ? overRow == row
                      ? `${rowColor?.background.split('-').slice(0, -1).concat('800').join('-')}/50`
                      : rowColor?.background
                    : overRow == row
                      ? 'bg-black/20'
                      : ''}
                {color?.foreground || rowColor?.foreground}"
              onmousemove={() => (overRow = row)}
              data-over-row={row}
            >
              {#if header?.display && header.display instanceof Function}
                {header.display(item[header.key], item)}
              {:else if item[header.key] != null && item[header.key] !== '' && item[header.key] !== 0 && item[header.key] !== '0'}
                {#if header?.display}
                  {display(header.display, item[header.key])}
                {:else}
                  {item[header.key]}
                {/if}
              {/if}
            </div>
          {/each}

          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_mouse_events_have_key_events -->
          {#if !hideAction}
            <div
              class="border-b px-1 border-gray-500 text-center
                {overRow == row ? 'bg-black/20' : rowColor?.background}"
              onmousemove={() => (overRow = row)}
            ></div>
          {/if}
        {/each}
      {/if}

      {#if bottomSpace}
        <div class="col-span-full h-[50dvh]"></div>
      {/if}
    </div>
  </div>

  <!-- Table Side Content -->
  {#if sidebar}
    {@render sidebar()}
  {/if}
</div>
