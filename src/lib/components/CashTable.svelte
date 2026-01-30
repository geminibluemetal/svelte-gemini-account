<script>
  import { onMount } from 'svelte';

  const {
    title = '',
    income = [],
    expense = [],
    hideSerial = false,
    hideAction = false,
    bottomSpace = true,
    moveToEnd = true
  } = $props();

  let overRow = $state(-1);
  let container = $state(null);

  const gridTemplate = $derived(``);

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
        class="col-span-10 bg-red-700 text-white text-center font-bold border-b-2 border-white sticky top-0"
      >
        {title}
      </div>

      <div
        class="col-span-5 sticky top-6.5 z-20 bg-black text-white border-r-2 border-white text-center px-1"
      >
        Income
      </div>
      <div
        class="col-span-5 sticky top-6.5 z-20 bg-black text-white border-r-0 border-white text-center px-1"
      >
        Expense
      </div>

      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Time
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        SN
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Description
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Amount
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Sign
      </div>

      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Time
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        SN
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Description
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-2 border-white text-center px-1 border-t-2"
      >
        Amount
      </div>
      <div
        class="sticky top-12.5 z-20 bg-black text-white border-r-0 border-white text-center px-1 border-t-2"
      >
        Sign
      </div>

      <!-- BODY -->
      {#each Array.from( { length: income.length > expense.length ? income.length : expense.length } ) as _, row (row)}
        <div class="border-r border-b px-1 border-gray-500">{income[row]?.time}</div>
        <div class="border-r border-b px-1 border-gray-500">{income[row]?.serial}</div>
        <div class="border-r border-b px-1 border-gray-500">{income[row]?.description}</div>
        <div class="border-r border-b px-1 border-gray-500">{income[row]?.amount}</div>
        <div class="border-r-2 border-r-black border-b px-1 border-gray-500">
          {income[row]?.sign}
        </div>

        <div class="border-r border-b px-1 border-gray-500">{expense[row]?.time}</div>
        <div class="border-r border-b px-1 border-gray-500">{expense[row]?.serial}</div>
        <div class="border-r border-b px-1 border-gray-500">{expense[row]?.description}</div>
        <div class="border-r border-b px-1 border-gray-500">{expense[row]?.amount}</div>
        <div class="border-r-0 border-b px-1 border-gray-500">{expense[row]?.sign}</div>
      {/each}

      {#if bottomSpace}
        <div class="col-span-full h-[20dvh]"></div>
      {/if}
    </div>
  </div>
</div>
