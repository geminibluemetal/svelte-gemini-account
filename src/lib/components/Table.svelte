<script>
  const { title = '', headers = [], items = [] } = $props();

  let overRow = $state(-1);

  const gridTemplate = $derived(`auto repeat(${headers.length}, minmax(max-content, 1fr)) auto`);
</script>

<div class="p-5 h-screen flex flex-col">
  <div class="flex-1 overflow-auto border-2 border-black">
    <!-- ONE GRID -->
    <div class="grid" style="grid-template-columns: {gridTemplate};">
      <!-- TITLE ROW -->
      <div
        class="col-span-full bg-red-700 text-white text-center font-bold border-b-2 border-white sticky top-[0px]"
      >
        {title}
      </div>

      <!-- HEADER -->
      <div class="sticky top-6.5 z-20 bg-black text-white border-r-2 border-white text-center px-1">
        S.No
      </div>

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
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <div
          class="border-r border-b px-1 py-0.5 border-gray-400 text-center
          {overRow == row ? 'bg-gray-200' : 'bg-white'}"
          onmouseover={() => (overRow = row)}
        >
          {row + 1}
        </div>

        {#each headers as header, col (col)}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_mouse_events_have_key_events -->
          <div
            class="border-r border-b px-1 py-0.5 border-gray-400
            {overRow == row ? 'bg-gray-200' : 'bg-white'}"
            onmouseover={() => (overRow = row)}
          >
            {item[header.key]}
          </div>
        {/each}

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <div
          class="border-b px-1 py-0.5 border-gray-400 text-center
          {overRow == row ? 'bg-gray-200' : 'bg-white'}"
          onmouseover={() => (overRow = row)}
        ></div>
      {/each}
    </div>
  </div>
</div>
