<script>
  import { onMount } from 'svelte';

  const {
    title = '',
    headers = [],
    items = [],
    hideSerial = false,
    bottomSpace = true,
    moveToEnd = true
  } = $props();

  let overRow = $state(-1);
  let container = $state(null);

  const gridTemplate = $derived(
    `${hideSerial ? '' : 'auto'} repeat(${headers.length}, minmax(max-content, 1fr)) auto`
  );

  onMount(() => {
    if (moveToEnd) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div class="p-5 h-screen flex flex-col">
  <div class="flex-1 overflow-auto border-2 border-black" bind:this={container}>
    <!-- ONE GRID -->
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <!-- TITLE ROW -->
      <div
        class="col-span-full bg-red-700 text-white text-center font-bold border-b-2 border-white sticky top-0"
      >
        {title}
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

      <div class="sticky top-6.5 z-20 bg-black text-white text-center px-1">Action</div>

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
        <div
          class="border-b px-1 border-gray-500 text-center
          {overRow == row ? 'bg-black/20' : 'bg-white'}"
          onmouseover={() => (overRow = row)}
        ></div>
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[50dvh]"></div>
      {/if}
    </div>
  </div>
</div>
