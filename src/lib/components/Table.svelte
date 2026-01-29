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

      {#each headers as header}
        <div
          class="sticky top-6.5 z-20 bg-black text-white border-r-2 border-white text-center px-1"
        >
          {header.name}
        </div>
      {/each}

      <div class="sticky top-6.5 z-20 bg-black text-white text-center px-1">Action</div>

      <!-- BODY -->
      {#each items as item, row}
        <div
          class="border-r border-b px-1 py-0.5 text-center bg-white"
          onmouseover={() => (overRow = row)}
        >
          {row + 1}
        </div>
        {#each headers as header}
          <div class="border-r border-b px-1 py-0.5 bg-white" onmouseover={() => (overRow = row)}>
            {item[header.key]}
          </div>
        {/each}

        <div class="border-b px-1 py-0.5 text-center bg-white" onmouseover={() => (overRow = row)}>
          {overRow}
          {overRow == row ? 'true' : 'false'}
        </div>
      {/each}
    </div>
  </div>
</div>
