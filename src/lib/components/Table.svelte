<script>
  import { onMount } from 'svelte';

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
    `${hideSerial ? '' : '45px'} ${headersGridColumnsWidth} ${hideAction ? '' : '100px'}`
  );

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div class="p-5 h-screen flex flex-col w-fit">
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
            onmouseover={() => (overRow = row)}
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
            onmouseover={() => (overRow = row)}
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
            onmouseover={() => (overRow = row)}
          ></div>
        {/if}
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[50dvh]"></div>
      {/if}
    </div>
  </div>
</div>
